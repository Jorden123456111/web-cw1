# v1.3 Assessment Mapping

This document maps submission evidence to the assessment grid for quick examiner navigation.

## Content (75%)

| Criterion | Evidence |
| --- | --- |
| API Functionality & Implementation | `src/routes/*`, `src/controllers/*`, `tests/api.test.js` |
| Code Quality & Architecture | Layered structure (`routes`, `controllers`, `models`, `middleware`), described in `docs/Technical_Report.md` |
| Documentation (API & Technical Report) | `docs/API_Documentation.md`, `docs/API_Documentation.pdf`, `docs/Technical_Report.md`, Swagger `/api-docs` |
| Version Control & Deployment | Version tags (`v1.0` to `v1.3`), CI workflow `.github/workflows/ci.yml`, deployment procedure `docs/Deployment_Guide.md` |
| Testing & Error Handling | `tests/api.test.js`, `src/middleware/errorHandler.js`, `npm run test:coverage` output |
| Creativity & GenAI Usage | `docs/GenAI_Declaration.md`, analytics features in `src/controllers/analyticsController.js` |

## Presentation (15%)

| Criterion | Evidence |
| --- | --- |
| Structure & Clarity | `docs/Presentation_Plan.md` slide-by-slide outline |
| Visual Aids & Delivery | Recommended screenshots/demo flow in `docs/Presentation_Plan.md` |
| Time Management | 10-minute timed script plan in `docs/Presentation_Plan.md` |

## Q&A (10%)

| Criterion | Evidence |
| --- | --- |
| Depth of Understanding | technical rationale in `docs/Technical_Report.md` |
| Ability to Explain Design Decisions | architecture and trade-offs in `docs/Technical_Report.md` |
| Response to Technical Questions | Q&A bank in `docs/Presentation_Plan.md` |

## Final Submission Checklist

- [ ] Public repository link is accessible.
- [ ] `docs/API_Documentation.pdf` exists and matches current API behavior.
- [ ] Technical report includes final links (repo/docs/slides/live deployment).
- [ ] Slide deck is uploaded and linked in the technical report.
- [ ] Live deployment URL is added in `docs/Technical_Report.md`.
- [ ] Git tag `v1.3` is pushed.
