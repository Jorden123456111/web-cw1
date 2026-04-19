# Football Statistics API

A REST API for football match statistics, team/player management, and analytics. Built with Node.js, Express, Sequelize, and SQLite.

## Version

Current release: `v1.3.0`
Release type: `Final submission candidate`

## v1.3 Highlights

- Real dataset import pipeline from Kaggle CSV (`data/results.csv`)
- Two new analytics endpoints:
  - `GET /api/analytics/teams/:id/form-trend`
  - `GET /api/analytics/teams/:id/home-away`
- Pagination hard cap (`limit <= 100`) via shared middleware
- Database indexes for frequent filters/sorts on `Match` and `Player`
- Security middleware enabled: `helmet` + request rate limiting
- Expanded automated tests: 56 integration tests, 82.68% statement coverage
- CI workflow for automated verification on push/PR (`.github/workflows/ci.yml`)

## Submission Artifacts

- Technical report: `docs/Technical_Report.md`
- API documentation (Markdown): `docs/API_Documentation.md`
- API documentation (PDF): `docs/API_Documentation.pdf` (generated via `npm run docs:pdf`)
- Assessment mapping: `docs/Assessment_Mapping.md`
- Deployment guide: `docs/Deployment_Guide.md`
- Presentation pack: `docs/Presentation_Plan.md`
- GenAI declaration: `docs/GenAI_Declaration.md`

## Tech Stack

- Node.js + Express
- Sequelize ORM
- SQLite
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Validation via `express-validator`
- Swagger UI (`/api-docs`)
- Jest + Supertest

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

Create `.env`:

```env
PORT=3000
JWT_SECRET=football_stats_api_secret_key_2026
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 3. Prepare Data

Option A: Import real dataset

1. Download `results.csv` from Kaggle:
   - https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017
2. Put it at `data/results.csv`
3. Run:

```bash
npm run import
```

Option B: Use built-in seed data

```bash
npm run seed
```

### 4. Run API

```bash
npm start
```

Swagger docs: `http://localhost:3000/api-docs`

## Default Accounts

- Admin: `admin@footballstats.com` / `admin123`
- Demo: `demo@footballstats.com` / `demo123`

## Endpoint Summary

### Authentication

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | No | Role is always assigned as `user` |
| POST | `/api/auth/login` | No | Returns JWT |
| GET | `/api/auth/profile` | Yes | Current user profile |

### Teams

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/teams` | No |
| GET | `/api/teams/:id` | No |
| POST | `/api/teams` | Yes |
| PUT | `/api/teams/:id` | Yes |
| DELETE | `/api/teams/:id` | Admin |

### Players

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/players` | No |
| GET | `/api/players/:id` | No |
| POST | `/api/players` | Yes |
| PUT | `/api/players/:id` | Yes |
| DELETE | `/api/players/:id` | Admin |

### Matches

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/matches` | No |
| GET | `/api/matches/:id` | No |
| POST | `/api/matches` | Yes |
| PUT | `/api/matches/:id` | Yes |
| DELETE | `/api/matches/:id` | Admin |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/leaderboard` | Standings by season + competition |
| GET | `/api/analytics/top-scorers` | Top scorers |
| GET | `/api/analytics/teams/:id/performance` | Team performance summary |
| GET | `/api/analytics/head-to-head` | Team-vs-team record |
| GET | `/api/analytics/seasons/:season` | Season summary and monthly goals |
| GET | `/api/analytics/teams/:id/form-trend` | Rolling form and cumulative points |
| GET | `/api/analytics/teams/:id/home-away` | Home vs away split and home advantage |

## Testing

```bash
npm test
npm run test:coverage
```

Latest local results on this branch:

- Tests: `56 passed`
- Coverage: `82.68% statements`

## Documentation PDF Generation

```bash
npm run docs:pdf
```

This command exports `docs/API_Documentation.md` to `docs/API_Documentation.pdf` for submission.

## Notes

- List endpoints use shared pagination middleware with a maximum `limit` of `100`.
- `data/*.csv` is gitignored; only import scripts and metadata are tracked.
