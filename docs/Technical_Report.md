# Technical Report: Football Statistics API (v1.3.0 Final)

## 1. Submission Links

- Public GitHub repository:
  - https://github.com/Jorden123456111/web-cw1
- API documentation:
  - Markdown: `docs/API_Documentation.md`
  - PDF: `docs/API_Documentation.pdf`
- Presentation materials:
  - Slide deck link: `ADD_YOUR_PUBLIC_SLIDE_LINK_HERE`
  - Presentation structure reference: `docs/Presentation_Plan.md`

## 2. Project Overview

This project delivers a RESTful API for football statistics and analytics with:

- full CRUD for Teams, Players, and Matches
- JWT authentication and role-based authorization
- validation, pagination, and centralized error handling
- analytics endpoints for leaderboard, top scorers, team performance, head-to-head, form trend, and home/away split

Final release for assessment: `v1.3.0`.

## 3. Architecture and Design Justification

The codebase follows a layered architecture:

- `routes/` for endpoint contract and middleware composition
- `controllers/` for business logic and response shaping
- `models/` for Sequelize schema definitions and associations
- `middleware/` for cross-cutting concerns (auth, validation, pagination, error handling)
- `scripts/` for seed/import operations

Why this design was selected:

- improves maintainability by isolating responsibilities
- supports iterative feature growth without route/controller coupling
- improves testability by keeping request validation and domain logic explicit

## 4. Data Model and Dataset Integration

Core entities:

- `User` (authentication, role)
- `Team` (metadata and lookup attributes)
- `Player` (stats and team relationship)
- `Match` (fixtures/results with home and away team keys)

Important relationships:

- Team 1..* Player
- Team 1..* Match (as home team)
- Team 1..* Match (as away team)

Dataset integration:

- source: Kaggle international football results (`results.csv`)
- import command: `npm run import`
- pipeline: CSV parse, sanitization, season derivation, team normalization, batch insert

## 5. Security, Validation, and Error Handling

Implemented controls:

- password hashing via `bcryptjs`
- JWT authentication for protected endpoints
- role-based access control for destructive operations
- input validation through `express-validator`
- secure headers using `helmet`
- request throttling using `express-rate-limit` (200 requests / 15 min / IP)
- normalized error response format through global error middleware

## 6. API Feature Coverage

Implemented endpoint groups:

- authentication (`/api/auth/*`)
- teams (`/api/teams/*`)
- players (`/api/players/*`)
- matches (`/api/matches/*`)
- analytics (`/api/analytics/*`)

Advanced analytics delivered:

- leaderboard by season and competition
- head-to-head comparison
- season trend summary
- team form trend (`/form-trend`)
- home vs away split (`/home-away`)

## 7. Testing Strategy and Evidence

Testing approach:

- integration tests with Jest + Supertest
- covers auth flows, CRUD paths, authorization, validation, pagination, analytics, and edge cases

Execution commands:

```bash
npm test
npm run test:coverage
```

Latest local results for `v1.3.0`:

- tests: **56 passed**
- statement coverage: **82.68%**

Reliability note:

- test database is isolated in memory when `NODE_ENV=test` to avoid persistence-related flakiness

## 8. Version Control and Release Discipline

Versioning and release practice:

- semantic versioning applied (`v1.0` -> `v1.1` -> `v1.2` -> `v1.3`)
- commit history tracks incremental feature and quality improvements
- release tagging used for assessment-ready snapshots
- CI workflow (`.github/workflows/ci.yml`) runs tests and coverage on push/PR

## 9. Deployment Status and Evidence

This release includes deployment-ready instructions in `docs/Deployment_Guide.md`.

- required evidence for marking: hosted URL + screenshot + successful endpoint checks
- placeholder to fill before submission: `ADD_DEPLOYED_API_URL_HERE`

## 10. GenAI Usage Declaration (Methodological)

GenAI was used as a structured engineering assistant for:

- design alternatives and trade-off exploration
- drafting/refining implementation candidates
- regression risk checking and test planning
- improving documentation quality and coherence

Human ownership safeguards:

- generated outputs were reviewed, edited, and validated by tests before inclusion
- all final architectural and implementation decisions were made by the project author
- usage details and prompts are documented in `docs/GenAI_Declaration.md`

## 11. Limitations and Next Iteration (v1.4 Candidate)

Current limitations:

- SQLite is suitable for coursework/demo but not ideal for high-concurrency production
- no refresh-token lifecycle implemented
- no automated load/performance benchmark suite yet

Planned next iteration:

1. migrate production deployment to managed Postgres
2. add CI quality gates for lint + test + coverage thresholds
3. introduce caching for expensive analytics queries
4. add audit logging for write operations
5. expand negative-path and load testing

## 12. References

- Express: https://expressjs.com/
- Sequelize: https://sequelize.org/
- SQLite: https://www.sqlite.org/
- Jest: https://jestjs.io/
- Supertest: https://github.com/ladjs/supertest
- Swagger/OpenAPI tooling:
  - https://github.com/Surnet/swagger-jsdoc
  - https://github.com/scottie1984/swagger-ui-express
- Dataset source:
  - https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017
