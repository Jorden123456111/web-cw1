# Presentation Plan (10 Minutes)

Use this structure to maximize marks for Presentation and Q&A.

## Slide 1 (0:00-0:40) - Project Context

- module + assessment title
- project goal and domain
- final release version: `v1.3.0`

## Slide 2 (0:40-1:40) - Architecture

- layered diagram: routes -> controllers -> models -> database
- explain why this architecture improves maintainability and testing

## Slide 3 (1:40-2:40) - Data Design

- entity relationship overview (`User`, `Team`, `Player`, `Match`)
- explain key associations and indexing decisions

## Slide 4 (2:40-3:40) - Security and Validation

- JWT auth + role checks
- `helmet`, rate limiting, validation, error format

## Slide 5 (3:40-5:20) - Live Demo

- show `GET /` root response
- show Swagger (`/api-docs`)
- run one CRUD flow + one analytics endpoint

## Slide 6 (5:20-6:20) - Testing Evidence

- show `npm test` result (56 passed)
- show coverage summary (82.68% statements)
- explain what is tested (auth, CRUD, analytics, edge cases)

## Slide 7 (6:20-7:10) - Version Control Discipline

- show tag progression (`v1.0` -> `v1.3`)
- show meaningful commit messages
- show CI workflow on push/PR

## Slide 8 (7:10-8:00) - Deployment Evidence

- deployed URL
- screenshot of successful public endpoint and Swagger
- mention deployment platform and env config

## Slide 9 (8:00-8:50) - GenAI Methodology

- where GenAI was used (design alternatives, code drafting, documentation refinement)
- how outputs were verified (manual review + tests)

## Slide 10 (8:50-10:00) - Q&A Backup

- keep this slide minimal with key reminders:
  - architecture decisions
  - trade-offs (SQLite vs managed DB)
  - security choices
  - next iteration plan (v1.4)

## Q&A Bank

1. Why SQLite for this project?
- Fast local setup and reproducibility for coursework; production migration path is documented.

2. How did you validate correctness?
- Integration test suite (56 tests) plus coverage run at 82.68% statements.

3. How is authorization enforced?
- JWT middleware authenticates users; role checks restrict destructive operations to admins.

4. What design trade-off did you make?
- Chose clear layered architecture over ultra-compact code to improve readability and maintenance.

5. How did GenAI contribute?
- Used for idea exploration and drafting, but all outputs were reviewed and validated before merge.
