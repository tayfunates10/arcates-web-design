# Arcates pre-release usage QA

This branch is intentionally not a production release.

The QA gate covers:

- database validation, migrations, drift detection and repeatable seed
- existing behavior tests, TypeScript and production build
- application startup, liveness, readiness and smoke checks
- public navigation, metadata, robots and sitemap
- authentication and role-protected administration flows
- public forms, validation and failure states
- API authorization, malformed input and rate-limit behavior
- responsive browser checks and accessibility-critical interactions
- Docker application and migration targets

Any release tag or deployment remains blocked until the QA findings are resolved and the final report is accepted.
