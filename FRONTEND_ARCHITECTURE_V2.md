# SPESIFIKASI ARSITEKTUR FRONTEND V2 — PT. BARAK IOMS
**Repositori Target:** `bimasenaadhirajasaradika_fe`  
**Aplikasi:** PT. Bimasena Adhirajasa Radhika — Integrated Outsourcing Management System (IOMS)  
**Fase Refaktorisasi:** STEP 2 (Refaktorisasi Arsitektur Frontend)  
**Status:** DIIMPLEMENTASIKAN & DIVERIFIKASI  

---

## 1. RINGKASAN EKSEKUTIF & GAMBARAN MIGRASI

Pada STEP 2, arsitektur frontend PT. BARAK IOMS telah direfaktorisasi untuk menghadirkan **Lapisan Akses Data (Data Access Layer / DAL) yang tangguh**, **Mesin Penyimpanan Ber-namespace (Namespaced Storage Engine)**, **Pola Repositori (Repository Pattern)**, **mesin serialisasi kueri REST API yang telah diperbaiki**, **kontrak/tipe data domain terpusat**, serta **organisasi rute modular dengan penjaga rute berbasis peran (Role-Based Guards)**.

Seluruh 15 komponen halaman pendaratan (landing page) tetap **100% dibekukan (frozen) / hanya-baca (read-only)**.

### Perubahan Arsitektur Utama:
| Fitur / Komponen | Arsitektur V1 (Sebelum Step 2) | Arsitektur V2 (Implementasi Step 2) |
|---|---|---|
| **Akses Data** | Komponen UI memanggil langsung adapter yang tersebar dengan variabel memori RAM sementara atau kunci tanpa namespace. | Pemisahan berlapis yang jelas: `Halaman -> Fitur/Hook -> Service Adapter -> Repositori -> Mesin Penyimpanan / REST API`. |
| **Mesin Penyimpanan** | Kunci penyimpanan menggunakan awalan lokal tanpa standar seragam (`barak_*`), tidak memiliki abstraksi kueri terpusat. | Modul terpusat `storageEngine.js` dengan namespace `outsourcing_dev_`, event reaktif, dan auto-migrasi data lama. |
| **Pola Repositori** | Belum ada; manipulasi array (`filter`, `slice`, pembuatan ID) terduplikasi di lebih dari 14 adapter berbeda. | `BaseRepository` menyediakan metode baku: `list()`, `getById()`, `create()`, `update()`, `softDelete()`, dan `requestDelete()`. |
| **Klien API (`apiClient.js`)** | Metode `get(path)` membuang parameter kueri sepenuhnya; tanpa serialisasi `URLSearchParams`. | `apiClient.js` kini dilengkapi `buildUrlWithParams`, serialisasi otomatis `URLSearchParams`, dan amplop respons terstandarisasi. |
| **Mode API / Mock** | Pengalihan mode tidak terstandarisasi. | Standardisasi `DATA_MODE` (`mock` vs `api` vs `rest`), default disetel ke `mock`. |
| **Kontrak Domain** | Tidak bertipe ketat; data karyawan dicampur langsung dengan data klien dan site penugasan. | Kontrak terpusat di `src/types/index.js` yang memisahkan `InternalEmployee`, `OutsourcingEmployee`, dan `Placement`. |
| **Routing & RBAC** | Monolitik 406 baris pada `router/index.jsx`; hanya memeriksa status sesi login (`RequireAuth`), sehingga rute eksekutif bocor ke semua peran. | Terbagi modular di `src/app/routes/` dengan penjaga `<RequireRole>` yang menegakkan batasan hak akses peran dan menampilkan halaman 403 Forbidden. |

---

## 2. PERBANDINGAN STRUKTUR FOLDER

### Struktur Folder Arsitektur V2
```
c:\laragon\www\bimasenaadhirajasaradika\frontend\src
├── app/
│   ├── guards/
│   │   ├── RequireAuth.jsx          # Memvalidasi sesi login pengguna
│   │   ├── RequirePermission.jsx    # Validasi izin tingkat komponen
│   │   └── RequireRole.jsx          # Penjaga RBAC tingkat rute (penangan 403)
│   ├── providers/
│   │   └── AuthProvider.jsx         # State autentikasi global & evaluator izin
│   ├── routes/                      # RUTE MODULAR TERSTRUKTUR
│   │   ├── index.jsx                # Menggabungkan seluruh modul rute
│   │   ├── publicRoutes.jsx         # 15 rute Website Publik yang DIBEKUKAN
│   │   ├── authRoutes.jsx           # /ops/login
│   │   └── roleRoutes.jsx           # Rute operasional yang dilindungi hak peran
│   └── router/
│       └── index.jsx                # Titik masuk router provider
│
├── components/
│   ├── layout/                      # AppShell, Sidebar, Topbar, Breadcrumb, PageHeader
│   └── ui/                          # Button, Badge, Card, KpiCard, Modal, StateViews, PageLoader
│
├── constants/
│   ├── business.js                  # Konstanta bisnis, 18 klien riil, jenis layanan
│   ├── permissions.js               # 116 string izin terperinci
│   ├── roles.js                     # 8 peran resmi & rute default masing-masing
│   └── status.js                    # Enum status universal & kelas badge Tailwind
│
├── data/                            # LAPISAN AKSES DATA TERPADU (DAL)
│   ├── storage/
│   │   └── storageEngine.js         # Mesin penyimpanan ber-namespace & reaktif
│   └── repositories/
│       ├── baseRepository.js        # Kelas dasar CRUD, kueri, paginasi, soft-delete
│       ├── employeeRepository.js    # Kueri Karyawan Internal vs Outsourcing
│       ├── clientRepository.js      # Mitra Klien korporat
│       ├── siteRepository.js        # Lokasi proyek & site klien
│       ├── placementRepository.js   # Penugasan terpisah & riwayat rotasi tugas
│       ├── shiftRepository.js       # Shift jam kerja operasional
│       ├── userRepository.js        # Akun pengguna sistem aplikasi
│       ├── approvalRepository.js    # Pusat persetujuan Direktur & pengajuan hapus
│       └── index.js                 # Ekspor terpadu repositori
│
├── features/                        # MODUL FITUR & DOMAIN BISNIS
│   ├── landing/                     # Website Pemasaran Publik yang DIBEKUKAN
│   ├── auth/                        # Halaman Login internal & pengalih peran
│   ├── director/                    # Kokpit Eksekutif, Persetujuan, Risiko, Laporan
│   ├── hrd/                         # Lembar Absensi, Rekap Payroll, Kontrak Kerja
│   ├── operations/                  # Kesiapan Personel, Insiden, Pergantian, Patroli
│   ├── finance/                     # Faktur Tagihan, Penggajian, Rekonsiliasi COD
│   ├── legal/                       # Kasus Hukum, Kontrak PKS, Register Kepatuhan
│   ├── marketing/                   # Prospek (Leads), Pipeline CRM, Handover Klien
│   ├── it/                          # Tiket Helpdesk, Aset Perangkat, Pemeliharaan
│   ├── website/                     # CMS Artikel, Karir, FAQ, Pertanyaan Masuk, SEO
│   ├── master/                      # Data Master (Karyawan, Klien, Site, Shift, Penugasan, User)
│   ├── audit/                       # Jejak Audit Kepatuhan Global
│   ├── notifications/               # Pusat Notifikasi Pengguna
│   ├── profile/                     # Profil Akun Pengguna
│   └── search/                      # Pencarian Global Lintas Entitas
│
├── services/
│   ├── adapters/                    # 23 Service Adapter Domain
│   ├── api/
│   │   └── apiClient.js             # Re-ekspor klien API target
│   ├── apiClient.js                 # Klien REST yang diperbaiki dengan URLSearchParams
│   └── mock/                        # 11 koleksi seed data tiruan awal
│
├── types/
│   └── index.js                     # Kontrak tipe domain & JSDoc terpusat
│
└── utils/
    ├── auditLogger.js               # Pengirim event log audit
    ├── imageResize.js               # Utilitas kanvas pengubah ukuran foto 3x4
    └── storage.js                   # Jembatan kompatibilitas ke storageEngine
```

---

## 3. ARSITEKTUR ALIRAN DATA (DATA FLOW ARCHITECTURE)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna Operasional / Direktur
    participant UI as Halaman Fitur / Modal Form
    participant Service as Service Adapter / Hook
    participant Repo as Repositori Domain
    participant Storage as Mesin Penyimpanan (storageEngine.js)
    participant LS as LocalStorage (outsourcing_dev_*)
    participant ApiClient as apiClient.js (ketika DATA_MODE=api)

    User->>UI: Berinteraksi dengan UI (Buat, Edit, Filter, Pengajuan Hapus)
    UI->>Service: Memanggil metode adapter (contoh: getEmployees, createEmployee)
    
    alt Mode Tiruan / Lokal (DATA_MODE=mock)
        Service->>Repo: Memanggil metode repositori (contoh: list, create, requestDelete)
        Repo->>Storage: Baca/Tulis dengan deduplikasi otomatis & pembuatan ID
        Storage->>LS: Simpan ke kunci ber-namespace (contoh: outsourcing_dev_employees)
        Storage-->>UI: Mengirimkan event 'outsourcing_storage_updated'
        Storage-->>Repo: Mengembalikan data yang telah dibersihkan
        Repo-->>Service: Mengembalikan amplop standar { data, meta, error: null }
    else Mode REST Backend (DATA_MODE=api / rest)
        Service->>ApiClient: Memanggil metode HTTP (contoh: get(url, { params }))
        ApiClient->>ApiClient: buildUrlWithParams (mengubah objek ke URLSearchParams)
        ApiClient->>ApiClient: Menyematkan Bearer token dari sessionStorage
        ApiClient-->>Service: Mengembalikan respons REST { data, meta, error }
    end

    Service-->>UI: State terbarui; UI merender ulang dengan status loading/empty/error
```

---

## 4. SPESIFIKASI POLA REPOSITORI (REPOSITORY PATTERN)

Berada di `src/data/repositories/baseRepository.js`.

### Metode Baku Repositori:
1. `list({ search, filters, page, pageSize, sortBy, sortDir, includeDeleted })`:
   - Otomatis menyaring catatan yang berstatus *soft-delete* (`isDeleted === true`) kecuali diberikan opsi `includeDeleted: true`.
   - Menjalankan pencarian teks tanpa membedakan huruf besar/kecil (*case-insensitive*) pada semua atribut teks.
   - Menerapkan filter eksak atau predikat dinamis.
   - Melakukan pemotongan dan pembagian halaman (*pagination*); mengembalikan format: `{ data, meta: { total, page, pageSize, totalPages }, error: null }`.
2. `getById(id)`:
   - Mengambil satu data tunggal berdasarkan *primary key* (`id`); mengembalikan `{ data, error }`.
3. `create(payload)`:
   - Secara otomatis menghitung urutan ID bisnis berikutnya (`generateNextId`) jika ID tidak disertakan pada *payload*.
   - Menyematkan data baru pada urutan terdepan koleksi.
   - Menambahkan stempel waktu `createdAt` dan `updatedAt`.
   - Mengembalikan `{ data: createdRecord, error: null }`.
4. `update(id, payload)`:
   - Memodifikasi catatan data di tempat; menjamin integritas *primary key* tidak berubah.
   - Menambahkan stempel waktu `updatedAt`.
   - Mengembalikan `{ data: updatedRecord, error: null }`.
5. `requestDelete(id, { reason, requestedBy, entityLabel })`:
   - Mengirimkan pengajuan resmi `DeleteRequest` ke Pusat Persetujuan Direktur (`outsourcing_dev_delete_requests`).
   - **Tidak** mengubah atau merusak data operasional yang ada.
   - Mengembalikan `{ data: { success: true, pendingApproval: true, requestId }, error: null }`.
6. `softDelete(id, { deletedBy, reason })`:
   - Menetapkan atribut: `isDeleted: true`, `status: STATUS.INACTIVE`, `deletedAt`, `deletedBy`, `deleteReason`.
   - Mempertahankan arsip data untuk kebutuhan pelaporan historis dan verifikasi audit kepatuhan.
7. `hardDelete(id)`:
   - Utilitas pembersihan data permanen khusus untuk fungsi administratif dan pengujian otomatis (*test suite*).

---

## 5. STRATEGI PENYIMPANAN DATA

### A. Standar Namespace
- Awalan standar: `outsourcing_dev_`
- Kunci-kunci utama:
  - `outsourcing_dev_employees`
  - `outsourcing_dev_clients`
  - `outsourcing_dev_sites`
  - `outsourcing_dev_placements`
  - `outsourcing_dev_shifts`
  - `outsourcing_dev_users`
  - `outsourcing_dev_delete_requests`
  - `outsourcing_dev_approvals`
  - `outsourcing_dev_incidents`
  - `outsourcing_dev_replacements`
  - `outsourcing_dev_field_reports`

### B. Mesin Migrasi Otomatis (Auto-Migration Engine)
Ketika membaca data melalui `storage.get(key)`:
1. Mesin terlebih dahulu memeriksa ketersediaan kunci dengan format `outsourcing_dev_${key}`.
2. Jika tidak ditemukan, mesin memeriksa kunci format lama `barak_${key}`.
3. Apabila kunci lama ditemukan, data otomatis dimigrasikan ke `outsourcing_dev_${key}` dan disinkronkan kembali.
4. Seluruh data pengguna dan skenario uji yang ada tetap berfungsi normal tanpa kehilangan data.

### C. Pemulihan Mandiri & Deduplikasi (Self-Healing Deduplication)
Jika di dalam localStorage terdapat rekaman data duplikat yang memiliki ID primer sama (akibat proses konkuren sebelumnya), `storage.getCollection()` secara otomatis mendeduplikasi array tersebut, mempertahankan data kemunculan pertama yang valid, dan segera menuliskan kembali data yang bersih ke localStorage.

---

## 6. STRATEGI ARSITEKTUR API

### A. Perbaikan Pengiriman Parameter (`src/services/apiClient.js`)
Implementasi lama mengabaikan parameter `{ params }`. Utilitas baru `buildUrlWithParams(path, params)` menjamin parameter terserialisasi menjadi query string dengan benar:
```javascript
export function buildUrlWithParams(path, params) {
  const url = path.startsWith('http://') || path.startsWith('https://')
    ? new URL(path)
    : new URL(`${API_BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`);

  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}
```

### B. Kata Kerja HTTP Standar (Standard HTTP Verbs)
- `restClient.get(path, options)`: meneruskan `options.params` ke fungsi `buildUrlWithParams`.
- `restClient.post(path, body, options)`: menyerialisasi *body* ke format JSON.
- `restClient.put(path, body, options)`: penggantian data entitas secara menyeluruh.
- `restClient.patch(path, body, options)`: pembaruan sebagian atribut entitas.
- `restClient.delete(path, options)`: penghapusan sumber daya di endpoint target.

### C. Pengalihan Mode Eksekusi
Dikendalikan melalui variabel lingkungan `VITE_DATA_MODE` atau `VITE_API_MODE`:
- `mock` (Default): Menggunakan repositori lokal dan penyimpanan ber-namespace.
- `api` / `rest`: Mengarahkan semua panggilan API melalui `apiClient.js` ke backend `http://localhost:3001/api/v1`.

---

## 7. STRATEGI ROUTING & KONTROL AKSES (RBAC)

### A. Struktur Rute Modular (`src/app/routes/`)
- `publicRoutes.jsx`: Memuat seluruh 15 halaman publik (`/`, `/perusahaan`, `/layanan`, `/client`, `/career`, `/news`, `/blog`, `/faq`, `/contact`). **DIBEKUKAN (FROZEN)**.
- `authRoutes.jsx`: Memuat rute `/ops/login`.
- `roleRoutes.jsx`: Memuat seluruh rute operasional internal yang dilindungi.
- `index.jsx`: Menggabungkan seluruh rute di bawah kerangka layout `<AppShell>` yang dilindungi oleh `<RequireAuth>`.

### B. Penjaga Rute Tingkat URL (`<RequireRole>`)
Mencegah perpindahan navigasi URL tanpa hak akses yang sah:
```jsx
// Contoh implementasi pada src/app/routes/roleRoutes.jsx:
{
  path: 'director',
  element: (
    <RequireRole allowedRoles={[ROLES.DIREKTUR]}>
      <Suspense fallback={<PageLoader />}>
        <DirectorLayout />
      </Suspense>
    </RequireRole>
  ),
  // ...
}
```
- Jika pengguna belum login: dialihkan ke `/ops/login` dengan membawa data rute tujuan (`state.from`).
- Jika peran pengguna tidak memiliki izin: merender antarmuka **403 Forbidden State View** khusus, dilengkapi tombol kembali ke dasbor beranda resmi pengguna terkait.

---

## 8. CATATAN MIGRASI & KOMPATIBILITAS MUNDUR

1. **Kompatibilitas Adapter:** Seluruh adapter lama tetap mengekspor antarmuka fungsinya seperti semula (`getEmployees`, `createEmployee`, dll.) sehingga tidak merusak halaman antarmuka pengguna yang telah ada.
2. **Jembatan Penyimpanan (Storage Bridge):** File `src/utils/storage.js` mengekspor ulang fungsi `getStoredCollection` dan `saveStoredCollection` yang didukung langsung oleh mesin `storageEngine.js`, memastikan pengujian unit lama tetap lulus tanpa modifikasi kode.
3. **Tanpa Regresi UI:** Tampilan form modal dan halaman daftar tabel tetap menjaga estetika visual dan perilaku responsif aslinya.

---

## 9. CATATAN TUGAS TAHAP STEP 3

Pada **STEP 3 (Penyempurnaan Data Master, HRD & Operasional)**, pekerjaan berikut direncanakan dan dieksekusi:
1. **Pemisahan Form Karyawan:** Memisahkan UI Master Karyawan menjadi **Karyawan Internal** (tanpa penugasan klien) dan **Karyawan Outsourcing** (dengan sertifikasi keahlian dan status kesiapan unit tugas).
2. **Siklus Hidup Penugasan:** Menghubungkan `AssignmentListPage.jsx` dan `AssignmentFormModal.jsx` ke `placementRepository` dengan pencatatan riwayat rotasi tugas.
3. **Ekspansi Layout HRD:** Menambahkan tab navigasi Karyawan Internal dan Karyawan Outsourcing ke dalam `HRDLayout.jsx`.
4. **Ekspansi Layout Operasional:** Menambahkan tab direktori Klien & Site langsung ke dalam `OperationsLayout.jsx`.
5. **Lembar Absensi Persisten:** Memastikan setiap pengeditan jam masuk/pulang pada `attendanceAdapter.js` tersimpan permanen saat halaman di-refresh (F5) melalui `storageEngine`.

---

## 10. HASIL PENGUJIAN AKSEPTASI

Seluruh verifikasi berjalan bersih dan sukses:

```bash
npm test
```
- **61/61 Pengujian RBAC & Peran:** `LULUS (PASSED)`
- **42/42 Pengujian CRUD, Storage Engine, Repository Pattern & Kueri:** `LULUS (PASSED)`
- **Total Pengujian Keseluruhan:** **103/103 LULUS (100%)**

```bash
npm run lint
```
- **0 kesalahan, 0 peringatan** (Patuh standar ESLint 100%).

```bash
npm run build
```
- **Paket produksi Vite berhasil dibangun dalam 4.94 detik** tanpa ada kesalahan impor atau dependensi sirkular.

---
*Akhir Dokumen FRONTEND_ARCHITECTURE_V2.md*
