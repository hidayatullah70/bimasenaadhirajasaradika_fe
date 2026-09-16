# SOT — IMPLEMENTATION PLAN
## PT. Bhimasena Adhirajasa Radhika

### Phase 0 — Foundation
- Initialize React + Vite
- Configure Tailwind CSS
- Create design tokens
- Create routing/layout structure
- Create API client abstraction
- Create mock data layer

**Done when:** app boots, responsive shell works, tokens/components compile.

### Phase 1 — Design System
Build:
- Button
- Input/Select/Textarea
- Card
- Badge
- Modal
- Toast
- Table
- Empty/Error/Loading states
- Navbar/Sidebar/Topbar

**Done when:** pages can be composed without duplicated UI patterns.

### Phase 2 — Landing Page
Build:
1. Navbar
2. Hero
3. Company/value proposition
4. 6 services
5. Advantages
6. Process
7. Portfolio/client proof
8. Testimonials
9. FAQ
10. Contact CTA
11. Footer

**Done when:** mobile-to-desktop responsive and CTA flow is complete.

### Phase 3 — Authentication + App Shell
- Login
- Auth state
- Protected routes
- Role-based navigation
- Dashboard shell

### Phase 4 — Dashboard Modules
Order:
1. Owner
2. HRD
3. Operasional
4. Finance
5. Marketing

Prioritize shared master data and reusable CRUD patterns.

### Phase 5 — API Integration
- Replace mock service with API client
- Auth
- Dashboard summary
- CRUD resources
- Pagination/filtering
- Error mapping
- Loading states

### Phase 6 — QA & Hardening
- Responsive testing
- Accessibility checks
- Route/role checks
- Form validation
- API error handling
- Performance review
- Build verification

### Suggested Frontend Structure
```text
src/
├─ app/
│  ├─ router/
│  ├─ providers/
│  └─ store/
├─ components/
│  ├─ ui/
│  ├─ layout/
│  └─ shared/
├─ features/
│  ├─ landing/
│  ├─ auth/
│  ├─ owner/
│  ├─ hrd/
│  ├─ finance/
│  ├─ marketing/
│  └─ operasional/
├─ services/
│  ├─ api/
│  └─ mock/
├─ hooks/
├─ lib/
├─ data/
├─ App.jsx
├─ main.jsx
└─ index.css
```

### Engineering Rules
- SOT first: change docs before introducing new scope.
- Reuse components.
- Keep business logic out of presentational components.
- Keep API calls behind services/hooks.
- Use mock data before backend is available.
- No unnecessary dependency.
- No page-specific styling duplication.
