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

## Deploy

```bash
npm run check
npm run db:migrate:remote
git push
```

Cloudflare Pages build output is `dist`.

More project notes: [docs/features.md](docs/features.md).
