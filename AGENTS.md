# AGENTS.md
## PT. Bhimasena Adhirajasa Radhika — Initial Project Contract

### Mission
Build the PT. Bhimasena Adhirajasa Radhika web platform exactly against the SOT documents.

### Source of Truth
Priority order:
1. `01-PRD.md`
2. `02-USER-FLOW.md`
3. `03-UI-GUIDELINE.md`
4. `04-API-SPEC.md`
5. `05-IMPLEMENTATION-PLAN.md`
6. This `AGENTS.md`
7. Execution prompt

If implementation conflicts with SOT, SOT wins.

### Stack
- HTML5
- React
- Vite
- Tailwind CSS
- JavaScript/JSX
- REST API-ready architecture

### Non-Negotiable Rules
1. Do not invent features outside SOT.
2. Do not change business terminology without updating SOT.
3. Prefer simple, maintainable solutions.
4. Use reusable components.
5. Mobile-first responsive UI.
6. Keep brand palette centralized.
7. Never hardcode API logic throughout pages.
8. Mock unavailable backend dependencies.
9. Every async screen has loading, empty, error and success states where applicable.
10. Do not add libraries unless they solve a clear SOT requirement.
11. Preserve accessibility and semantic HTML.
12. Do not replace React/Vite/Tailwind with another frontend stack.

### Definition of Done
A feature is done only if:
- It matches the relevant SOT.
- It works responsively.
- It uses shared UI patterns.
- It handles normal/error/empty/loading states.
- It does not create unauthorized scope.
- `npm run build` succeeds.

### Change Control
When a requested feature is outside scope:
`STOP → identify SOT conflict → propose SOT update → wait for approval → implement`.

### Code Quality
Favor readable code, small components, clear naming, and feature-based organization. Avoid premature abstraction.
