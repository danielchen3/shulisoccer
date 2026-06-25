import {
  getCurrentPlayer,
  hashPassword,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
  type AuthPlayer,
  type PlayerRole,
} from "../../../_lib/auth";

const POSITION_GROUPS = ["goalkeeper", "defender", "midfield", "forward"] as const;
const ROLES: PlayerRole[] = ["player", "captain", "admin"];

type PlayerField =
  | "positionGroup"
  | "position"
  | "number"
  | "filename"
  | "name"
  | "enName"
  | "club"
  | "nationality"
  | "nationalityFlag"
  | "province"
  | "age"
  | "birthday"
  | "height"
  | "weight"
  | "foot"
  | "starts"
  | "subs"
  | "goals"
  | "username"
  | "role"
  | "loginEnabled"
  | "passwordHash";

export const onRequestPatch: PagesFunction<AuthEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireAdmin(env, request);
  if ("response" in auth) return auth.response;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return jsonResponse({ error: "invalid_player_id" }, { status: 400 });
  }

  const existing = await env.DB.prepare(
    `
      SELECT
        id,
        positionGroup,
        position,
        number,
        filename,
        name,
        enName,
        club,
        nationality,
        nationalityFlag,
        province,
        age,
        birthday,
        height,
        weight,
        foot,
        starts,
        subs,
        goals,
        username,
        role,
        loginEnabled,
        lastLoginAt
      FROM players
      WHERE id = ?
    `
  ).bind(id).first<{ id: number; filename: string }>();
  if (!existing) return jsonResponse({ error: "not_found" }, { status: 404 });

  const patch = await parsePatchInput(request, existing.filename);
  if ("response" in patch) return patch.response;

  if (patch.filename && patch.filename.toLowerCase() !== existing.filename.toLowerCase()) {
    const duplicate = await env.DB.prepare(
      "SELECT id FROM players WHERE id <> ? AND (lower(filename) = lower(?) OR lower(username) = lower(?)) LIMIT 1"
    ).bind(id, patch.filename, patch.filename).first();
    if (duplicate) return jsonResponse({ error: "filename_already_exists" }, { status: 409 });
  }

  const assignments = patch.fields.map((field) => `${field} = ?`).join(", ");
  await env.DB.prepare(`UPDATE players SET ${assignments} WHERE id = ?`)
    .bind(...patch.values, id)
    .run();

  const row = await getAdminPlayer(env, id);
  await recordAuditLog(env, request, auth.player, {
    action: "player.update",
    resourceType: "player",
    resourceId: id,
    details: {
      before: existing,
      after: row,
      passwordReset: patch.fields.includes("passwordHash"),
    },
  });
  return jsonResponse({ player: row });
};

export const onRequestDelete: PagesFunction<AuthEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireAdmin(env, request);
  if ("response" in auth) return auth.response;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return jsonResponse({ error: "invalid_player_id" }, { status: 400 });
  }
  if (auth.player.id === id) {
    return jsonResponse({ error: "cannot_delete_self" }, { status: 400 });
  }

  const existing = await getAdminPlayer(env, id);
  if (!existing) return jsonResponse({ error: "not_found" }, { status: 404 });

  await env.DB.prepare("DELETE FROM players WHERE id = ?").bind(id).run();
  await recordAuditLog(env, request, auth.player, {
    action: "player.delete",
    resourceType: "player",
    resourceId: id,
    details: { before: existing },
  });
  return jsonResponse({ ok: true });
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

async function requireAdmin(
  env: AuthEnv,
  request: Request
): Promise<{ player: AuthPlayer } | { response: Response }> {
  const player = await getCurrentPlayer(env, request);
  if (!player) return { response: jsonResponse({ error: "unauthorized" }, { status: 401 }) };
  if (player.role !== "admin") {
    return { response: jsonResponse({ error: "forbidden" }, { status: 403 }) };
  }
  return { player };
}

async function getAdminPlayer(env: AuthEnv, id: number) {
  return env.DB.prepare(
    `
      SELECT
        id,
        positionGroup,
        position,
        number,
        filename,
        name,
        enName,
        club,
        nationality,
        nationalityFlag,
        province,
        age,
        birthday,
        height,
        weight,
        foot,
        starts,
        subs,
        goals,
        username,
        role,
        loginEnabled,
        lastLoginAt
      FROM players
      WHERE id = ?
    `
  ).bind(id).first();
}

async function parsePatchInput(
  request: Request,
  existingFilename: string
): Promise<{ fields: PlayerField[]; values: (string | number | null)[]; filename?: string } | { response: Response }> {
  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { response: jsonResponse({ error: "invalid_json" }, { status: 400 }) };
    }
    body = raw as Record<string, unknown>;
  } catch {
    return { response: jsonResponse({ error: "invalid_json" }, { status: 400 }) };
  }

  const fields: PlayerField[] = [];
  const values: (string | number | null)[] = [];
  let nextFilename = existingFilename;

  function push(field: PlayerField, value: string | number | null) {
    fields.push(field);
    values.push(value);
  }

  if ("positionGroup" in body) {
    const value = stringField(body.positionGroup);
    if (!POSITION_GROUPS.includes(value as (typeof POSITION_GROUPS)[number])) {
      return { response: jsonResponse({ error: "invalid_position_group" }, { status: 400 }) };
    }
    push("positionGroup", value);
  }

  for (const field of [
    "position",
    "filename",
    "name",
    "enName",
    "club",
    "nationality",
    "nationalityFlag",
    "province",
    "birthday",
    "foot",
  ] as const) {
    if (!(field in body)) continue;
    const value = field === "position" || field === "filename" || field === "name"
      ? stringField(body[field])
      : nullableStringField(body[field]);

    if ((field === "position" || field === "filename" || field === "name") && !value) {
      return { response: jsonResponse({ error: "required_fields_missing" }, { status: 400 }) };
    }
    if (field === "filename") {
      if (typeof value !== "string" || !/^[a-z0-9_-]{1,64}$/i.test(value)) {
        return { response: jsonResponse({ error: "invalid_filename" }, { status: 400 }) };
      }
      nextFilename = value;
      push("filename", value);
      push("username", value);
      continue;
    }
    push(field, value);
  }

  for (const [field, min, max] of [
    ["number", 0, 999],
    ["age", 0, 80],
    ["height", 0, 260],
    ["weight", 0, 260],
  ] as const) {
    if (!(field in body)) continue;
    const value = nullableInt(body[field], min, max);
    if (value === Number.NEGATIVE_INFINITY) {
      return { response: jsonResponse({ error: "invalid_number_field" }, { status: 400 }) };
    }
    push(field, value);
  }

  for (const [field, min, max] of [
    ["starts", 0, 1000],
    ["subs", 0, 1000],
    ["goals", 0, 1000],
  ] as const) {
    if (!(field in body)) continue;
    const value = intField(body[field], min, max);
    if (value === Number.NEGATIVE_INFINITY) {
      return { response: jsonResponse({ error: "invalid_number_field" }, { status: 400 }) };
    }
    push(field, value);
  }

  if ("role" in body) {
    const role = stringField(body.role);
    if (!ROLES.includes(role as PlayerRole)) {
      return { response: jsonResponse({ error: "invalid_role" }, { status: 400 }) };
    }
    push("role", role);
  }

  if ("loginEnabled" in body) {
    const raw = body.loginEnabled;
    const value = raw === false || raw === 0 || raw === "0" ? 0 : 1;
    push("loginEnabled", value);
  }

  if (body.resetPassword === true) {
    push("passwordHash", await hashPassword(`${nextFilename}_123`));
  }

  if (fields.length === 0) {
    return { response: jsonResponse({ error: "no_fields_to_update" }, { status: 400 }) };
  }

  return { fields, values, filename: nextFilename };
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableStringField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function nullableInt(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  return intField(value, min, max);
}

function intField(value: unknown, min: number, max: number): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    return Number.NEGATIVE_INFINITY;
  }
  return number;
}
