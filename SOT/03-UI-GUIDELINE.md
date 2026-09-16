# SOT — UI GUIDELINE
## PT. Bhimasena Adhirajasa Radhika

### 1. Design Direction
Modern, professional, trustworthy corporate outsourcing. Visual language: clean enterprise SaaS + strong corporate identity. Avoid excessive gradients, glassmorphism, decorative animation, and visual clutter.

### 2. Brand Palette
Primary identity:
- Red: `#BC1727`
- Yellow: `#FDE346`
- Green: `#15C110`
- Dark: `#17202A`
- Neutral: `#F5F7FA`
- White: `#FFFFFF`
- Border: `#E5E7EB`

Usage:
- Red = primary brand, CTA emphasis, critical status
- Yellow = highlights, attention, secondary CTA
- Green = success, operational-positive status
- Dark = headings/navigation
- Neutral = page backgrounds

Do not use all brand colors at equal visual weight.

### 3. Typography
Recommended: Inter or system sans-serif.
- H1: 40–56px desktop / 32–40px mobile
- H2: 30–40px / 26–32px
- H3: 20–24px
- Body: 15–16px
- Caption: 12–14px
Font weight hierarchy: 400 / 500 / 600 / 700.

### 4. Layout
- Max content width: 1200–1280px
- Desktop dashboard: sidebar + content
- Mobile dashboard: compact top bar + drawer navigation
- Card radius: 12–16px
- Button radius: 8–10px
- Consistent 4/8px spacing system

### 5. Landing Components
Navbar, Hero, ServiceCard, StatCard, ProcessStep, ClientLogo, Testimonial, FAQ, CTA, Footer.

### 6. Dashboard Components
Sidebar, Topbar, Breadcrumb, PageHeader, KPI Card, DataTable, FilterBar, Modal/Drawer, FormField, Badge, Tabs, Chart placeholder, EmptyState, ErrorState, Toast.

### 7. Interaction
- Primary CTA is visually dominant.
- Destructive action requires confirmation.
- Hover/focus states must be visible.
- Motion is short and functional (150–250ms).
- Respect reduced-motion preferences.

### 8. Responsive Breakpoints
Use Tailwind defaults:
- sm ≥ 640
- md ≥ 768
- lg ≥ 1024
- xl ≥ 1280

### 9. Accessibility
Semantic HTML, labels for fields, keyboard focus, adequate contrast, alt text, aria attributes where required.

### 10. Component Rule
If a UI pattern appears twice, convert it into a reusable component. Never duplicate dashboard styling page-by-page.
