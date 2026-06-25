# Project Notes

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Cloudflare Pages Functions
- Database: Cloudflare D1
- Local runtime: Wrangler Pages Dev

## Main Features

- Public team site: news, players, matches, top scorers, jersey, moments
- Player login with HttpOnly session cookie
- RBAC: `player`, `captain`, `admin`
- Admin pages for news, players, and audit logs
- Player discussion board with threads, comments, pin, lock, and soft delete
- News and match comments with replies, likes, and emoji reactions
- Event-driven comment audit logging with Cloudflare Queues and a Worker consumer
- Edge caching for public players/news APIs with Cloudflare KV and admin-side invalidation
- Local smoke tests and GitHub Actions CI

## Data Model Highlights

- `players`: public player profile plus login fields
- `sessions`: hashed login sessions
- `discussion_threads` / `discussion_comments`: internal team forum
- `content_comments` / `content_comment_reactions`: reusable comments for news and matches
- `audit_logs`: admin/security activity trail
- `COMMENT_EVENTS` queue: asynchronous comment/reaction audit events consumed by `workers/comment-events.ts`
- `PUBLIC_CACHE` KV: optional edge cache for high-read public API responses

## Security Notes

- Passwords are salted PBKDF2 hashes
- Session cookie is HttpOnly and SameSite=Lax
- Write APIs check same-origin requests
- Public player API does not expose password hashes
- Admin/captain permissions are enforced in Pages Functions
- Comment audit events use Queue-based async processing with a synchronous fallback when the queue binding is unavailable
- Public API cache reads/writes are best-effort and bypass automatically when the KV binding is unavailable

## Useful Routes

```text
/#/login
/#/admin
/#/admin/news
/#/admin/players
/#/admin/audit
/#/discussion
```

## Deployment Notes

- Apply D1 migrations locally with `npm run db:migrate:local`
- Apply D1 migrations remotely with `npm run db:migrate:remote`
- Cloudflare Pages should bind D1 as `DB`
- Cloudflare Pages should build with `npm run build` and publish `dist`
