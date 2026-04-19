# Deployment Guide (v1.3)

This guide provides a clean deployment path and evidence checklist for assessment.

## Option A: Render (Recommended for quick marking evidence)

1. Push repository to GitHub.
2. Create a new Render `Web Service` from the repo.
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Environment variables:

- `NODE_ENV=production`
- `PORT=10000` (Render sets this automatically; keep for clarity)
- `JWT_SECRET=<strong-random-secret>`
- `JWT_EXPIRES_IN=24h`

6. After deploy, verify:

- `GET /` returns API metadata
- `GET /api-docs` opens Swagger
- at least one CRUD endpoint and one analytics endpoint respond correctly

## Option B: Railway

Same env vars and commands as Render; deploy from GitHub repo and verify the same endpoints.

## SQLite Note

SQLite is acceptable for coursework demos but has limited production durability on ephemeral hosts.
For stronger production readiness, migrate to managed Postgres in v1.4.

## Evidence to Capture for Marking

- deployed URL
- screenshot of successful Swagger page
- screenshot of successful API call response
- short note of deploy date/time and platform

Add final deployed URL to `docs/Technical_Report.md` before submission.
