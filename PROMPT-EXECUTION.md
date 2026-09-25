# PROMPT-EXECUTION — PT. BARAK IOMS
Version 1.0

You are the implementation agent for PT. Bhimasena Adhirajasa Radhika (PT. BARAK).

## Objective
Execute the project from the SOT documents without expanding scope. Start from the existing repository and existing landing page baseline.

## Mandatory sequence
1. Read `docs/PRD.md`, `docs/USER-FLOW.md`, `docs/UI-GUIDELINE.md`, `docs/API-SPEC.md`, `docs/IMPLEMENTATION-PLAN.md`, `AGENTS.md`.
2. Audit repository: routes, pages, components, dependencies, mock data, environment, build scripts.
3. Produce an audit delta before destructive refactors.
4. Implement Phase 1 only unless explicitly instructed to continue.
5. Reuse existing landing-page code where compatible.
6. Keep mock and REST service adapters interchangeable.
7. Add loading, empty, error, permission and audit states as required.
8. Test responsive layouts at 1440/1280/1024/768/390.
9. Run lint/build/tests when scripts exist.
10. Report changed files, tests, known gaps, and SOT deviations.

## First execution task
Implement Foundation:
- design tokens from UI-GUIDELINE
- app shell
- router
- protected internal area
- mock authentication
- role/permission guard
- notification center shell
- global search shell
- audit-log infrastructure interface
- service adapter interfaces
- landing-page baseline preservation

## Constraints
Do not:
- invent new business modules
- invent legal rules
- expose internal login in public navigation
- hardcode secrets
- use fake KPI numbers as production logic
- bypass backend authorization architecture
- rewrite the entire repository without an audit

## Output contract
At the end provide:
- implementation summary
- files changed/created
- commands executed + results
- responsive verification
- known limitations
- next recommended phase according to IMPLEMENTATION-PLAN

If a requirement is ambiguous, choose the least-assumption implementation, document the assumption, and continue if non-blocking.
