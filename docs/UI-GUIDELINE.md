# UI-GUIDELINE — PT. BARAK IOMS
Version 1.0

## 1. Visual Direction
Modern enterprise: professional, clean, information-dense but breathable. Avoid decorative UI without business value.

## 2. Tokens
```css
--primary-red: #BA1D23;
--primary-yellow: #F9CE3B;
--accent-green: #32B23E;
--ink: #0F172A;
--slate: #334155;
--muted: #64748B;
--border: #E2E8F0;
--canvas: #F8FAFC;
--surface: #FFFFFF;
--info: #2563EB;
--warning: #D97706;
--danger: #DC2626;
--success: #16A34A;
```

## 3. Layout
- Desktop: sidebar + topbar + content.
- Sidebar collapsible.
- Content max-width mengikuti kebutuhan modul; enterprise tables boleh full width.
- Base spacing: 4/8px rhythm.
- Radius: 10–14px.
- Shadow: subtle, only for hierarchy.

## 4. Typography
- Primary stack: Modern sans-serif system stack (`Inter`, `system-ui`, `-apple-system`, `sans-serif`).
- Futuristic / Technology accent stack: `Orbitron` (`font-orbitron`), used for system credits, tech identifiers, and developer branding.
Hierarchy:
- H1: page purpose (3xl to 4xl sm/lg)
- H2: section (2xl font-bold)
- H3: card/module (lg/xl font-semibold)
- Body: operational data (sm/base, slate-700/white/70)
- Caption: metadata/help (xs, slate-500/white/40)
Numbers in KPI use tabular/monospaced numerals where supported.

## 5. App Shell
```text
Sidebar
Topbar: Search | Notifications | Profile
Breadcrumb
Page title + description + primary action
Filters/date range
KPI row
Main content
Activity / audit where relevant
```

## 6. Tables
Must support when relevant:
search, filter, sort, pagination, column visibility, export, bulk action, status badge, row action.
Desktop-first; mobile horizontal scroll or card transformation.

## 7. Forms
Label + field + helper/error. Required validation. Prevent duplicates. Loading/success/error states. Unsaved-change warning for long forms. No browser alert as primary UX.

## 8. Status
Never use color alone. Pair with text/icon.
- Success: #16A34A
- Warning: #D97706
- Danger: #DC2626
- Info: #2563EB
- Accent Highlights & Active State: #32B23E (`--accent-green` replaces generic blue highlights/borders across landing components)

## 9. Detail Pattern
```text
Header: ID | Title | Status | Primary Action
Summary
Tabs: Overview | Documents | Related | Activity | Audit
```

## 10. Attendance Spreadsheet
Locked columns: Employee ID, NIK, Name, Service, Position, Client, Location, Shift, Scheduled In/Out.
Editable by HRD: Check-in, Check-out.
Calculated: Total Hours, Status, Late, Early Leave, Overtime, System Note.
Freeze identity columns; sticky header; inline validation; bulk fill; clear; validate; save draft; finalize; reopen; export.

## 11. Responsive
Test at 1440, 1280, 1024, 768, 390px.
- Desktop (`>= 1024px`): Full navigation bar, quick search, CTA buttons, and expanded tables.
- Tablet / Mobile (`< 1024px`): Drawer sidebar / hamburger navigation, stacked KPI, compact filters, mobile forms.

## 12. Accessibility
Semantic HTML, keyboard navigation, visible focus, labels, ARIA where needed, contrast, text/icon status, icon tooltip/accessible label.

## 13. Landing Page & Public Navigation Standards
Reuse and elevate the project baseline at https://bimasenaadhirajasaradika.vercel.app/ adhering strictly to the brand identity:

### 13.1 Public Navbar
- **Header Background**: Default `bg-accent-green` (`#32B23E`) with subtle shadow; transitions on scroll to `bg-white/95 backdrop-blur-md` with `border-b border-slate-200`.
- **Responsive Breakpoint**: Synchronized at `lg` (1024px).
  - Screens `>= 1024px`: Displays full 9-item menu navigation, Quick Search input (`w-28 sm:w-32 lg:w-36 xl:w-44`), and red "Hubungi Kami" CTA button.
  - Screens `< 1024px`: Displays Brand Logo on left and hamburger menu button on right (`lg:hidden`). All menus, search, and CTA are contained within the mobile drawer.
- **Quick Search**: Pill input with green background (`bg-white/15`), white border (`border-white/60`), and dark ink text (`text-ink` / `#0F172A`) on focus.
- **CTA Button**: Pill red button (`bg-primary-red hover:bg-red-800 text-white rounded-full`) linking directly to `/contact`.

### 13.2 Hero Sections & Pill Badges
- **Dark Hero Header**: Standardized dark background (`bg-ink py-20`) across Profil Perusahaan (`/perusahaan/profil`), Layanan (`/layanan`), Klien & Portofolio (`/client`), Karir (`/career`), News (`/news`), Blog (`/blog`), and FAQ (`/faq`).
- **Container Alignment**: All hero headers and sidebar layouts use `w-full px-4 sm:px-6 lg:px-8` left-aligned with navbar brand logo.
- **Hero Pill Badges**: Unified green badge design:
  `bg-accent-green/20 text-accent-green border border-accent-green/30 px-3 py-1 rounded-full text-xs font-semibold mb-3`
  Applied consistently to Career ("Peluang Karir Terbuka"), News ("Warta & Berita Resmi"), Blog ("Insight & Edukasi Outsourcing"), and FAQ ("Pusat Informasi & Jawaban").

### 13.3 Contact Page (`/contact`)
- **Layout**: 2-Column responsive container (`max-w-6xl mx-auto`).
- **Left Column**: "Kirim Pesan" inquiry form (Nama Lengkap, Perusahaan, Email, No. Telepon, Jenis Layanan, Pesan, and Red submit button with icon).
- **Right Column**: Verified Google Maps embed of PT. Bimasena Adhirajasa Radhika in Tangerang, clickable office address linking to Google Maps (`target="_blank"`), dedicated WhatsApp links (`0851 2479 9305` for Konsultasi, `0851 7433 4336` for Lowongan Kerja), email `ptbimasenaadhirajasaradika@gmail.com`, and operational hours.

### 13.4 Public Footer
- **Theme**: Dark ink (`bg-ink text-white`) 4-column grid.
- **Columns**: Brand & Social Links, Layanan, Tautan Cepat, and Kontak.
- **Social Icons**: Facebook, Instagram, TikTok, and Twitter with official URLs opening in a new tab (`target="_blank"`) and brand-specific hover colors (`#1877F2`, `#E4405F`, `#00F2FE`, `#1DA1F2`).
- **Kontak Info**: Verified Tangerang address linking to Google Maps with hover state, dual WhatsApp numbers, email, and red Hubungi Kami button.
- **Copyright & Developer Credit**:
  `Sistem IOMS v1.0 by BionoraDev` linking to WhatsApp (`https://wa.me/6281384224733`) with `font-orbitron` typography and `Dev` colored in blue-cyan (`text-cyan-400`).

### 13.5 Floating CTA & Navigation (`FloatingAdminCTA`)
- **Position**: Fixed bottom-right (`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3`).
- **Main Admin Trigger Button**: 3D Emerald gradient sphere (`#10B981` to `#047857`) with inner top-edge gloss reflection and drop shadow. Admin Headset icon (`Headset`) remains visible at all times (both default and hover/active states). Pulsing beacon ring active when closed.
- **Hover/Click Popover**: Stacks 2 WhatsApp action buttons directly above the trigger, vertically center-aligned with the trigger button:
  1. **WA Konsultasi**: White pill badge with green border (`border-[#25D366]`), dark ink text (`text-[#0F172A]`) "Chat Konsultasi", and 3D WhatsApp Green sphere icon (`w-12 h-12`). Links to `https://wa.me/6285124799305`.
  2. **WA Loker**: White pill badge with green border (`border-[#25D366]`), dark ink text (`text-[#0F172A]`) "Chat Loker", and 3D WhatsApp Green sphere icon (`w-12 h-12`). Links to `https://wa.me/6285174334336`.
- **Back To Top CTA Button**:
  - **Position**: Directly below the Admin button (`w-14 h-14 rounded-full`).
  - **Visibility**: Default hidden (`opacity-0 max-h-0 pointer-events-none`). Automatically slides in with smooth ease-out when user scrolls at least half of the viewport height (`window.scrollY > window.innerHeight / 2`).
  - **3D Aesthetic**: Multi-stop primary red gradient (`#EF4444` to `--primary-red: #BA1D23` to `#881317`), tactile bevel inset highlights, drop shadow, and top glossy reflection.
  - **Icon**: Upward chevron panah atas (`ChevronUp`) in `--primary-yellow: #F9CE3B` with micro-animation on hover.
  - **Action**: Smooth scroll back to top of the page (`window.scrollTo({ top: 0, behavior: 'smooth' })`).

### 13.6 Career Application Modal (`JobApplicationModal` on `/career`)
- **Trigger**: Clicking "Kirim Lamaran" on any job vacancy card on `/career` immediately opens the comprehensive application form dialog.
- **Form Sections**:
  1. **Data Pribadi (eKTP)**: Nama Lengkap (sesuai eKTP), NIK (16 digit), Tempat & Tanggal Lahir, Usia, Nomor SIM (khusus Kurir), dan Alamat Lengkap sesuai eKTP.
  2. **Kontak & Komunikasi**: Email Aktif, Nomor HP / WhatsApp, dan Nomor HP Darurat.
  3. **Data Rekening Bank**: Nama Bank, Nomor Rekening, dan Nama Pemilik Rekening.
  4. **Petunjuk Berkas Dokumen**: Catatan instruksi pengiriman berkas lengkap (CV, eKTP, SIM, KK, Ijazah Terakhir, Foto Selfie) dalam format ZIP/PDF langsung dari WhatsApp pelamar ke nomor admin `+6285187845044`.
- **Submission Action**:
  - Validates all required fields and formats.
  - Compiles formatted structured message and dispatches directly to official WhatsApp Rekrutmen PT. BARAK: `6285187845044` (`https://wa.me/6285187845044?text=...`).