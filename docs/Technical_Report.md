# Technical Report: Football Statistics API (v1.2)

## 1. Project Overview

This project is a REST API for football statistics and analytics. It includes complete CRUD for teams, players, and matches, plus domain analytics such as leaderboard, top scorers, team form, and season-level trends.

The project objective was to combine:

- clean CRUD design
- relational data modelling
- analytical endpoints over real-world style data
- authentication, authorization, validation, testing, and documentation

The current release is `v1.2.0`.

## 2. Technology Choices

| Layer | Choice | Reason |
| --- | --- | --- |
| Runtime | Node.js | Fast iteration and strong ecosystem for API development |
| Framework | Express | Flexible middleware pipeline and clear routing |
| ORM | Sequelize | Model associations, constraints, and cross-table queries |
| Database | SQLite | Portable local setup for assessment and demos |
| Auth | JWT + bcryptjs | Stateless API auth with hashed passwords |
| Validation | express-validator | Centralized request validation with readable rules |
| Documentation | Swagger (swagger-jsdoc + swagger-ui-express) | Interactive and examiner-friendly endpoint docs |
| Testing | Jest + Supertest | Full integration tests against API endpoints |

## 3. Architecture

The codebase uses a layered structure:

- `routes/`: HTTP contract and validation wiring
- `controllers/`: business logic and response shaping
- `models/`: Sequelize schema and associations
- `middleware/`: auth, validation, pagination, and global error handling
- `scripts/`: seed/import workflows

This separation keeps CRUD responsibilities distinct from analytics computation logic and improves maintainability for iteration.

## 4. Data Model

Core entities:

- `User`: authentication identity and role (`user` or `admin`)
- `Team`: team identity and metadata
- `Player`: player profile and aggregate performance fields
- `Match`: fixture/result record linking home and away teams

Important relationships:

- Team 1..* Player
- Team 1..* Match (home)
- Team 1..* Match (away)

`Match` and `Player` models include added indexes in v1.2 to improve common filtering and analytics query paths.

## 5. Public Dataset Integration (v1.2)

v1.2 introduced a real dataset import pipeline:

- Source: Kaggle international football results (`results.csv`)
- Location in project: `data/results.csv` (CSV ignored by git)
- Command: `npm run import`

Import workflow:

1. Parse CSV records.
2. Filter matches to 2018+ to keep size manageable.
3. Remove rows with invalid scores.
4. Normalize team names and create team records.
5. Auto-derive season values from date.
6. Insert matches in batches.
7. Create representative player records for major national teams.

License note: the source and license are cited in import script comments. The report should also cite the Kaggle dataset URL in final submission materials.

## 6. API Features and Iterative Progress

### v1.0 Baseline

- Core CRUD for Teams/Players/Matches
- Authentication endpoints
- Basic analytics endpoints
- Initial docs and test coverage

### v1.1 Hardening

- RBAC enforcement for destructive operations
- Better validation and error handling
- Improved project structure and consistency

### v1.2 Analytics + Data Upgrade

- Real dataset import from CSV
- New endpoint: `GET /api/analytics/teams/:id/form-trend`
- New endpoint: `GET /api/analytics/teams/:id/home-away`
- Shared pagination sanitization with hard cap (`limit <= 100`)
- Security middleware enabled globally (`helmet`, rate limiting)
- Additional indexes for query speed
- Expanded integration tests (56 total)

This versioning strategy demonstrates clear iteration rather than one-time delivery.

## 7. Security and Validation

Implemented controls:

- Password hashing with bcrypt
- JWT-based authentication
- Role checks for admin-only delete routes
- Request body and parameter validation (`express-validator`)
- Global security headers via `helmet`
- API-level rate limiting (`200` requests / `15` minutes / IP)

Error responses are normalized through centralized middleware.

## 8. Testing Strategy and Results

Testing uses Jest + Supertest integration tests and covers:

- authentication flows
- CRUD success/failure cases
- authorization boundaries
- validation failures
- analytics endpoint behavior and required params

Latest local v1.2 results:

- test suite: **56 passed**
- statement coverage: **about 82.5%**

A known practical note is to run test commands sequentially (not in parallel) when sharing one SQLite test DB file.

## 9. Documentation and Presentation Readiness

Submission-facing materials now include:

- `README.md` quick-start + feature summary
- `docs/API_Documentation.md` endpoint-level contract summary
- `docs/Technical_Report.md` architecture, dataset, security, testing, and iteration narrative
- Swagger UI for live API exploration

For oral presentation, useful evidence sections are:

- commit history across `v1.0`, `v1.1`, `v1.2`
- screenshots of Swagger docs and key endpoint responses
- test run output and coverage report
- dataset import command and resulting DB records

## 10. Limitations and Next Iteration (v1.3 candidate)

Current limitations:

- SQLite is not ideal for high-concurrency production use.
- No refresh token flow yet.
- Player aggregate stats are stored fields, not event-derived.

Planned v1.3 improvements:

1. Deploy to external hosting (for stronger marking bands).
2. Add CI pipeline for automated tests on push.
3. Add caching for heavy analytics routes.
4. Add audit trail/logging for write operations.
5. Add stronger negative-path and load tests.

## 11. Generative AI Usage Declaration

Generative AI was used as a productivity assistant for:

- refining architecture options
- drafting import logic and validation boilerplate
- improving documentation and report structure
- identifying regression risks during iteration

All generated output was reviewed, tested, and edited before inclusion.

