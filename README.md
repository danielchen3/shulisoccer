# Shuli Soccer

React + TypeScript + Cloudflare Pages Functions + D1.

## Setup

```bash
npm install
npm run db:migrate:local
npm run dev
```

Open:

```text
http://127.0.0.1:8788/
```

Use `8788` for local development. Port `5173` is only the Vite frontend server.

## Checks

```bash
npm run check
npm run test:smoke
```

`npm run check` type-checks the React app, Pages Functions, and the comment-event Queue consumer.

## Database

Local D1:

```bash
npm run db:migrate:local
```

Remote Cloudflare D1:

```bash
npm run db:migrate:remote
```

Run the remote migration before deploying new database changes.

## Comment Event Queue

Comment and reaction APIs enqueue audit-log side effects through Cloudflare Queues when
the `COMMENT_EVENTS` binding is available. Local dev and CI fall back to synchronous audit
logging so the app still works without a local queue.

One-time queue setup:

```bash
npm run queues:create
```

Deploy the consumer Worker:

```bash
npm run queues:deploy
```

## Public Edge Cache

Public `players` and `news` APIs use the optional `PUBLIC_CACHE` KV binding as an
edge cache. Admin player/news writes invalidate the related cache key after the D1
write succeeds. Without the binding, the APIs fall back to D1 and return
`x-edge-cache: BYPASS`.

One-time KV setup:

```bash
npm run cache:create
```

Bind the created KV namespace to Cloudflare Pages as `PUBLIC_CACHE`.

## Deploy

```bash
npm run check
npm run db:migrate:remote
npm run queues:deploy
git push
```

Cloudflare Pages build output is `dist`.

More project notes: [docs/features.md](docs/features.md).
