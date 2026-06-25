import { jsonResponse, type AuthEnv } from "../../_lib/auth";

interface TableRow {
  name: string;
}

interface CcxRow {
  username: string | null;
  role: string | null;
  loginEnabled: number | null;
  hasPasswordHash: number;
}

const REQUIRED_TABLES = ["players", "sessions", "audit_logs"] as const;
const PLAYER_AUTH_COLUMNS = ["username", "passwordHash", "role", "loginEnabled", "lastLoginAt"] as const;

export const onRequestGet: PagesFunction<AuthEnv> = async ({ env }) => {
  try {
    const { results: tableRows } = await env.DB.prepare(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name IN ('players', 'sessions', 'audit_logs')
      `
    ).all<TableRow>();

    const tables = new Set(tableRows.map((row) => row.name));
    const { results: playerColumns } = await env.DB.prepare("PRAGMA table_info(players)")
      .all<{ name: string }>();
    const playerColumnSet = new Set(playerColumns.map((column) => column.name));
    const ccx = await env.DB.prepare(
      `
        SELECT
          username,
          role,
          loginEnabled,
          CASE WHEN passwordHash IS NOT NULL AND length(passwordHash) > 0 THEN 1 ELSE 0 END AS hasPasswordHash
        FROM players
        WHERE lower(username) = lower('ccx')
        LIMIT 1
      `
    ).first<CcxRow>();

    return jsonResponse({
      ok: REQUIRED_TABLES.every((table) => tables.has(table)) &&
        PLAYER_AUTH_COLUMNS.every((column) => playerColumnSet.has(column)) &&
        ccx?.role === "admin" &&
        ccx?.loginEnabled === 1 &&
        ccx?.hasPasswordHash === 1,
      tables: Object.fromEntries(REQUIRED_TABLES.map((table) => [table, tables.has(table)])),
      playerColumns: Object.fromEntries(
        PLAYER_AUTH_COLUMNS.map((column) => [column, playerColumnSet.has(column)])
      ),
      ccx: ccx
        ? {
            username: ccx.username,
            role: ccx.role,
            loginEnabled: ccx.loginEnabled,
            hasPasswordHash: ccx.hasPasswordHash === 1,
          }
        : null,
    });
  } catch (error) {
    console.error("auth health check failed", error);
    return jsonResponse({ ok: false, error: "auth_health_failed" }, { status: 500 });
  }
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};
