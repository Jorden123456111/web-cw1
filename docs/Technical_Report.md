# Technical Report: Football Statistics API

**Module:** XJCO3011 — Web Services and Web Data
**Assessment:** Coursework 1 — Individual Web Services API Development Project
**Date:** April 2026

---

## 1. Introduction and Project Overview

This project delivers a RESTful API for football match statistics, covering team and player management, match record-keeping, and analytical endpoints such as league standings, top scorers, head-to-head comparisons, and season trend analysis. The API is backed by a relational database and secured with token-based authentication.

The domain was chosen for two reasons. First, football data is inherently relational — teams contain players, matches reference two teams, and analytical queries cut across all three entities — which makes it a natural fit for demonstrating SQL joins, aggregation, and layered data modelling. Second, the availability of well-structured public datasets (e.g. Kaggle's European football datasets) means the project can be seeded with realistic data without fabricating domain knowledge.

---

## 2. Technology Stack and Justification

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Runtime | Node.js | Event-driven, non-blocking I/O suits an API workload dominated by database queries rather than CPU-bound computation. The JavaScript ecosystem also means a single language across the full stack. |
| Framework | Express.js | Minimal and unopinionated. Unlike Django or NestJS, Express imposes almost no structural decisions, which allowed me to design the project layout (controllers, routes, middleware, models) from scratch — a deliberate choice to demonstrate architectural understanding. |
| ORM | Sequelize | Provides model definitions, migrations, associations, and query building without raw SQL. The association API (`hasMany`, `belongsTo`) maps cleanly onto the Team → Player and Team → Match relationships. |
| Database | SQLite | Zero-configuration, file-based, and fully portable. The examiner can clone the repository, run `npm run seed`, and have a populated database without installing PostgreSQL or MySQL. For a project of this scale (hundreds, not millions, of rows), SQLite introduces no meaningful performance limitation. |
| Authentication | JWT (jsonwebtoken + bcryptjs) | Stateless tokens avoid server-side session storage. Passwords are hashed with bcrypt before storage; tokens carry user ID and role, enabling role-based access control without additional database lookups on every request. |
| Validation | express-validator | Declarative validation chains keep route definitions readable and separate validation logic from business logic in controllers. |
| Documentation | swagger-jsdoc + swagger-ui-express | JSDoc-style annotations co-located with route definitions mean the documentation stays in sync with the code. Swagger UI provides an interactive testing interface at `/api-docs`. |
| Testing | Jest + Supertest | Jest handles test orchestration and assertions; Supertest sends real HTTP requests to the Express app without starting a live server, which keeps tests fast and deterministic. |

I considered Django REST Framework and FastAPI as alternatives. Django would have provided an admin panel and built-in ORM, but the overhead of Django's project structure felt excessive for an API-only project with no HTML rendering. FastAPI (Python) offers automatic OpenAPI generation and async support, but I was more confident delivering a polished result in JavaScript within the available timeframe, and Express's middleware model gave me finer control over request processing.

---

## 3. Architecture and Design Decisions

The application follows a layered MVC-style architecture:

**Routes** define URL patterns and attach validation middleware, then delegate to **controllers**. Controllers contain business logic and interact with **models** (Sequelize definitions). A global **error-handling middleware** catches exceptions from any layer and returns consistent JSON error responses with appropriate HTTP status codes.

Key design decisions:

**Separation of CRUD and analytics.** CRUD endpoints for teams, players, and matches live in their own route files and controllers. Analytical endpoints (leaderboard, top scorers, team performance, head-to-head, season summary) are grouped under `/api/analytics` with a dedicated controller. This separation keeps the codebase navigable and allows the analytics layer to evolve independently — for instance, adding caching or materialised views later without touching CRUD logic.

**Authentication on write operations only.** Read endpoints (GET) are public; create, update, and delete operations require a valid JWT. This mirrors real-world sports data APIs (e.g. football-data.org), where statistics are publicly queryable but data modification is restricted.

**Pagination by default.** All list endpoints return paginated responses with `page`, `limit`, `total`, and `totalPages` metadata. This prevents unbounded result sets and establishes a consistent response contract across endpoints.

**Computed analytics at query time.** The leaderboard, for example, is calculated by iterating over completed matches and accumulating points, goal difference, and win/draw/loss counts. For the current data volume this is fast enough. In a production system with millions of matches, I would pre-compute standings into a dedicated table and update them via database triggers or background jobs.

---

## 4. Database Schema

Four models are defined:

- **User** — `id`, `username`, `email`, `password` (bcrypt-hashed), `role` (user/admin).
- **Team** — `id`, `name`, `shortName`, `country`, `league`, `founded`, `stadium`, `logoUrl`.
- **Player** — `id`, `name`, `nationality`, `position`, `dateOfBirth`, `shirtNumber`, `goals`, `assists`, `appearances`, `yellowCards`, `redCards`, `teamId` (foreign key → Team).
- **Match** — `id`, `homeTeamId`, `awayTeamId` (both foreign keys → Team), `homeScore`, `awayScore`, `matchDate`, `season`, `competition`, `venue`, `referee`, `status`.

The Team–Player relationship is one-to-many. The Team–Match relationship is expressed through two foreign keys (`homeTeamId`, `awayTeamId`), each with its own Sequelize association alias (`homeTeam`, `awayTeam`). This dual-key pattern is standard for match/fixture modelling and enables queries like "find all matches involving Team X" using an `OR` condition.

---

## 5. Testing Approach

The test suite contains 29 integration tests organised into five groups: authentication, teams, players, matches, analytics, and general (root endpoint, 404 handling). Tests run against an in-memory SQLite database (created via `sequelize.sync({ force: true })` in `beforeAll`), so each test run starts from a clean state.

The tests cover the main success and failure paths: creating resources with and without authentication, handling duplicate entries, querying non-existent IDs, validating that analytics endpoints require mandatory parameters, and verifying correct HTTP status codes throughout. Edge cases such as attempting to create a match where the home and away teams are identical are also tested.

Running `npm test` executes the full suite in approximately 2.5 seconds.

---

## 6. Challenges and Lessons Learned

The most instructive challenge was handling Express 5's differences from Express 4. Express 5 was installed by default via npm, and its routing behaviour differs subtly — for instance, parameter validation and error propagation behave differently. Debugging a few silent failures in middleware chaining taught me to read changelogs carefully before adopting a major version upgrade.

Designing the analytics controller required thinking about data aggregation without relying on complex SQL. I chose to fetch relevant matches into memory and compute standings in JavaScript rather than writing raw SQL `GROUP BY` queries. This is less efficient at scale but far more readable and testable, and it keeps the codebase free of raw SQL strings that would undermine the purpose of using an ORM.

Seeding realistic data was another consideration. Random score generation needed to produce plausible football scorelines (mostly 0–3 goals per team, with a home-team advantage bias), not uniformly distributed random numbers. Tuning the probability distribution took a few iterations.

---

## 7. Limitations and Future Improvements

The current implementation has several known limitations that would need addressing for production use:

- **No rate limiting.** The API does not throttle requests, making it vulnerable to abuse. Adding `express-rate-limit` would be straightforward.
- **No refresh tokens.** JWT expiry requires a full re-login. A refresh token mechanism would improve the user experience.
- **Aggregated stats on Player model.** Goals, assists, and appearances are stored directly on the Player record rather than derived from match events. A more normalised design would record individual match performances in a separate table and compute totals via queries.
- **SQLite concurrency.** SQLite supports only one writer at a time. Under concurrent write load, PostgreSQL or MySQL would be necessary.
- **No deployment.** The API runs locally. Deploying to a platform like Railway or Render, with PostgreSQL as the database, would be the natural next step.

---

## 8. Generative AI Declaration

Generative AI tools were used throughout this project in the following capacities:

| Tool | Purpose |
|------|---------|
| Windsurf Cascade (Claude) | Code generation, architectural planning, debugging, writing seed data scripts, generating Swagger documentation annotations, writing tests, and drafting this report. |

AI was used as a pair-programming partner rather than a black-box code generator. I described the desired architecture, endpoint structure, and data model; the AI produced initial implementations which I reviewed, tested, and refined. Key decisions — the choice of Express over Django, the separation of analytics from CRUD, the decision to compute standings in-memory — were made by me and then implemented with AI assistance.

The most valuable use of AI was in accelerating boilerplate: Swagger JSDoc annotations, express-validator chains, and Sequelize model definitions are repetitive and error-prone to write manually. AI generated these reliably, freeing time to focus on the analytics logic and testing strategy.

Conversation logs from the Windsurf Cascade sessions are attached as supplementary material.

---

*Word count: approximately 1,200 words across 5 pages.*
