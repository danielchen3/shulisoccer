import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:8788";
const serverCommand = process.platform === "win32" ? "cmd.exe" : "npm";
const serverArgs = process.platform === "win32"
  ? ["/d", "/s", "/c", "npm.cmd run dev"]
  : ["run", "dev"];

let server = null;
let output = "";

try {
  if (!(await isServerReady())) {
    server = spawn(serverCommand, serverArgs, {
      cwd: process.cwd(),
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    server.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    server.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
  }

  await waitForServer();

  const anonymous = createClient();
  const unauth = await anonymous.fetch("/api/admin/news");
  assert(unauth.status === 401, `expected unauth admin news to be 401, got ${unauth.status}`);

  const admin = createClient();
  const login = await admin.fetch("/api/auth/login", {
    method: "POST",
    body: { username: "ccx", password: "ccx_123" },
  });
  assert(login.status === 200, `expected login 200, got ${login.status}`);

  const me = await admin.fetchJson("/api/auth/me");
  assert(me.player?.role === "admin", "expected ccx to be admin");

  await testNewsWorkflow(admin);
  await testPlayerWorkflow(admin);
  await testDiscussionWorkflow(admin);
  await testContentCommentsWorkflow(admin);
  await testAuditWorkflow(admin);

  console.log("Smoke tests passed");
} finally {
  stopServer(server);
}

async function testNewsWorkflow(client) {
  const created = await client.fetchJson("/api/admin/news", {
    method: "POST",
    body: {
      date: "2026-06-25",
      content: "Smoke CI News",
      image: "",
      body: "created by smoke test",
    },
  });
  const id = created.news.id;
  assert(id, "expected created news id");

  const updated = await client.fetchJson(`/api/admin/news/${id}`, {
    method: "PATCH",
    body: { content: "Smoke CI News Updated" },
  });
  assert(updated.news.content === "Smoke CI News Updated", "expected news update to persist");

  const deleted = await client.fetchJson(`/api/admin/news/${id}`, { method: "DELETE" });
  assert(deleted.ok === true, "expected news delete ok");
}

async function testPlayerWorkflow(client) {
  const filename = `smokeci${Date.now()}`;
  const created = await client.fetchJson("/api/admin/players", {
    method: "POST",
    body: {
      positionGroup: "midfield",
      position: "测试中场",
      number: 97,
      filename,
      name: "Smoke CI Player",
      enName: "Smoke CI",
      club: "Shuli FC",
      nationality: "China",
      nationalityFlag: "",
      province: "Test",
      age: 20,
      birthday: "2006-01-01",
      height: 180,
      weight: 70,
      foot: "右脚",
      starts: 1,
      subs: 2,
      goals: 3,
      role: "player",
      loginEnabled: 1,
    },
  });
  const id = created.player.id;
  assert(id, "expected created player id");

  const updated = await client.fetchJson(`/api/admin/players/${id}`, {
    method: "PATCH",
    body: { goals: 4, resetPassword: true },
  });
  assert(updated.player.goals === 4, "expected player update to persist");

  const publicPlayers = await client.fetchText("/api/players");
  assert(!publicPlayers.includes("passwordHash"), "public players API must not leak passwordHash");

  const deleted = await client.fetchJson(`/api/admin/players/${id}`, { method: "DELETE" });
  assert(deleted.ok === true, "expected player delete ok");
}

async function testDiscussionWorkflow(client) {
  const created = await client.fetchJson("/api/discussions", {
    method: "POST",
    body: {
      category: "training",
      title: "Smoke CI Discussion",
      body: "created by smoke test",
      pinned: true,
      locked: false,
    },
  });
  const id = created.thread.id;
  assert(id, "expected created thread id");

  const comment = await client.fetchJson(`/api/discussions/${id}/comments`, {
    method: "POST",
    body: { body: "smoke comment" },
  });
  const commentId = comment.comment.id;
  assert(commentId, "expected created comment id");

  const detail = await client.fetchJson(`/api/discussions/${id}`);
  assert(detail.comments.length === 1, "expected thread detail to include comment");

  await client.fetchJson(`/api/discussions/${id}/comments/${commentId}`, { method: "DELETE" });
  const deleted = await client.fetchJson(`/api/discussions/${id}`, { method: "DELETE" });
  assert(deleted.ok === true, "expected discussion delete ok");
}

async function testContentCommentsWorkflow(client) {
  const created = await client.fetchJson("/api/comments", {
    method: "POST",
    body: {
      targetType: "news",
      targetId: "1",
      body: "smoke content comment",
    },
  });
  const id = created.comment.id;
  assert(id, "expected content comment id");

  const reply = await client.fetchJson("/api/comments", {
    method: "POST",
    body: {
      targetType: "news",
      targetId: "1",
      parentCommentId: id,
      body: "smoke content reply",
    },
  });
  const replyId = reply.comment.id;
  assert(replyId, "expected content reply id");

  const reaction = await client.fetchJson(`/api/comments/${id}/reactions`, {
    method: "POST",
    body: { reaction: "like" },
  });
  assert(reaction.reactionCounts.like === 1, "expected like reaction count");

  const list = await client.fetchJson("/api/comments?targetType=news&targetId=1");
  assert(
    list.comments.some((comment) => comment.id === id && comment.reactionCounts.like === 1),
    "expected content comments list to include reaction count"
  );

  await client.fetchJson(`/api/comments/${replyId}`, { method: "DELETE" });
  const deleted = await client.fetchJson(`/api/comments/${id}`, { method: "DELETE" });
  assert(deleted.ok === true, "expected content comment delete ok");
}

async function testAuditWorkflow(client) {
  const audit = await client.fetchJson("/api/admin/auditLogs");
  assert(Array.isArray(audit.auditLogs), "expected auditLogs array");
  assert(audit.auditLogs.length > 0, "expected smoke actions to create audit logs");
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/me`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await delay(1_000);
  }
  throw new Error(`server did not become ready. Output:\n${output}`);
}

async function isServerReady() {
  try {
    const response = await fetch(`${baseUrl}/api/auth/me`);
    return response.ok;
  } catch {
    return false;
  }
}

function stopServer(child) {
  if (!child?.pid) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill();
}

function createClient() {
  const cookies = new Map();

  return {
    async fetch(path, options = {}) {
      const headers = new Headers(options.headers ?? {});
      headers.set("origin", baseUrl);

      if (options.body !== undefined) {
        headers.set("content-type", "application/json");
      }

      const cookie = cookieHeader(cookies);
      if (cookie) headers.set("cookie", cookie);

      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });

      storeCookies(cookies, response);
      return response;
    },
    async fetchJson(path, options = {}) {
      const response = await this.fetch(path, options);
      const text = await response.text();
      let body;
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`expected JSON from ${path}, got ${response.status}: ${text}`);
      }
      assert(response.ok, `${path} failed ${response.status}: ${text}`);
      return body;
    },
    async fetchText(path, options = {}) {
      const response = await this.fetch(path, options);
      const text = await response.text();
      assert(response.ok, `${path} failed ${response.status}: ${text}`);
      return text;
    },
  };
}

function storeCookies(cookies, response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return;

  for (const cookie of splitSetCookie(setCookie)) {
    const [pair] = cookie.split(";");
    const [name, value] = pair.split("=");
    if (name) cookies.set(name.trim(), value ?? "");
  }
}

function cookieHeader(cookies) {
  return [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function splitSetCookie(value) {
  return value.split(/,(?=\s*[^;,=]+=[^;,]+)/g);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
