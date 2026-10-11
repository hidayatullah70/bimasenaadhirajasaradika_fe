# USER FLOW — PT. BARAK IOMS
**Versi:** 2.0 (Authoritative Cross-Department Operational Workflows)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Sinkronisasi:** Mengintegrasikan `05_WORKFLOW_CONTRACT.md`, `06_STATUS_ENUMS.md`, dan seluruh alur kerja operasional teruji.

---

## 1. Prinsip Utama Alur Kerja
$$\text{Single Source of Truth} \longrightarrow \text{Business Workflow} \longrightarrow \text{Permission Boundary} \longrightarrow \text{Auditability} \longrightarrow \text{Graceful Recovery}$$

---

## 2. Public Visitor & Inbound Journey

### 2.1 Public Navigation & Quick Search Flow
```text
Public Visitor
├── Navbar Menu (Beranda, Perusahaan, Layanan, Klien & Portfolio, Karir, News, Blog, FAQ, Kontak)
├── Quick Search Keyword Router
│   ├── "keamanan" / "security" / "satpam" → /layanan/security
│   ├── "kurir" / "ekspedisi" / "cod"     → /layanan/kurir
│   ├── "parkir"                          → /layanan/parkir
│   ├── "cleaning" / "bersih"             → /layanan/cleaning-service
│   ├── "karir" / "loker" / "kerja"       → /career
│   ├── "klien" / "portfolio" / "proyek"  → /client
│   ├── "profil" / "tentang" / "direksi"  → /perusahaan/profil
│   └── other queries                     → /news
└── Company Profile Download
    └── Direct download official PDF: /assets/documents/company-profile-barak.pdf
```

### 2.2 Inbound Consultation & CRM Lead Flow (`/contact`)
```text
Visitor navigates to /contact (via Navbar CTA / Menu / Footer / Floating CTA)
├── Option 1: Inquiry Form Submission ("Kirim Pesan")
│   ├── Input: Nama Lengkap, Perusahaan, Email, No. Telepon, Jenis Layanan, Pesan
│   ├── Client Validation
│   ├── POST /cms/inquiries (cmsAdapter.submitInquiry())
│   ├── Success banner & state reset
│   └── Marketing Lead Queue otomatis terisi (Status: NEW)
│       └── Lead Qualification → Opportunity Pipeline → Deal WON
├── Option 2: Direct WhatsApp Channels
│   ├── WhatsApp Konsultasi (0851 2479 9305) → Chat Langsung Hubungan Klien
│   └── WhatsApp Karir / Rekrutmen (0851 8784 5044) → Chat Rekrutmen & eKTP
└── Option 3: Kantor Tangerang & Navigasi Peta
    ├── Embed Peta Google Maps Resmi PT. BARAK Tangerang
    └── Klik Alamat → Navigasi Google Maps di tab baru
```

---

## 3. Autentikasi Internal, Sesi, Profil & Keamanan Pengguna
```text
/ops/login
└── Input: Username & Password
    └── POST /auth/login
        ├── Sukses → Simpan Token JWT + Muat Hak Akses & Avatar (Role, Permissions, Avatar)
        │   └── Redirect ke Dashboard Sesuai Peran (/ops/director, /ops/hrd, dll.)
        └── Gagal → Tampilkan pesan kesalahan & cegah login

Sesi Berjalan (Session Lifecycle):
├── GET /auth/me → Sinkronisasi profil, otoritas RBAC, dan custom avatar pengguna aktif
├── Token Kedaluwarsa (HTTP 401) → Interceptor otomatis bersihkan sesi & redirect ke /ops/login
└── POST /auth/logout → Hapus token, bersihkan sesi, dan bersihkan riwayat kerja petugas inputer

Manajemen Profil & Keamanan Akun (/ops/profile):
├── A. Ubah Kata Sandi (Change Password Flow):
│   └── Klik "Ubah Kata Sandi" → Buka form Keamanan (default: hidden/collapsed)
│       └── Input Kata Sandi Saat Ini + Kata Sandi Baru (min 6 karakter) + Konfirmasi
│           └── PATCH /auth/change-password
│               ├── Sukses → Hash baru disimpan di database, catat log audit USER_PASSWORD_CHANGE
│               └── Gagal → Tampilkan validasi error (kata sandi lama salah / panjang < 6)
│
└── B. Pengelolaan Foto Profil (Avatar Lifecycle):
    └── Klik Ikon Kamera pada Lingkaran Profil → Menu Popover Mengambang:
        ├── 1. Opsi Galeri → Unggah berkas gambar dari penyimpanan perangkat
        ├── 2. Opsi Kamera → Ambil foto langsung melalui webcam/kamera perangkat
        └── 3. Opsi Hapus (jika ada foto) → Hapus foto profil, kembali ke inisial nama
        └── Pemrosesan Gambar & Persistensi:
            ├── Auto Center-Crop & Resize via HTML5 Canvas (Rasio 1:1 persegi, 256x256 px)
            ├── Instant Local Preview (0 ms latency) langsung merender gambar di UI
            ├── PATCH /auth/avatar (simpan Base64 DataURL / S3 URL ke database)
            │   ├── Mapping multi-alias (direkturutama ↔ juli.priyanto ↔ usr-001) & fallback foto profil terakhir
            │   ├── Broadcast window event 'barak:avatar-updated'
            │   ├── Bilah navigasi atas (Topbar kanan atas) & bilah navigasi samping (Sidebar kiri atas) seketika memperbarui foto
            │   ├── Foto persisten secara permanen dan tetap tampil saat logout maupun login ulang
            │   └── Catat log audit USER_AVATAR_UPDATE (atau USER_AVATAR_REMOVE jika dihapus)

Jika Terjadi Error Runtime Antarmuka (Route Error Boundary):
└── Tangkap via RouteErrorBoundary → Tampilkan layar ramah pemulihan dengan opsi "Muat Ulang" atau "Kembali ke Operasional".
```

---

## 4. Alur Penghapusan & Nonaktif Personil (Employee Deletion Workflow)

Mencegah penghapusan sepihak atau kehilangan data historis personil pengamanan:

```text
[HRD / Staf]
     │ Mengajukan Permohonan Hapus (input alasan tertulis)
     ▼
[POST /employees/:id/delete-request]
     │
     ├──> Karyawan ditandai: pendingDelete = true
     ├──> Backend menerbitkan rekaman di antrean `approvals`:
     │    (category = 'EMPLOYEE_DELETE', status = 'PENDING')
     └──> Log Audit tercatat: 'EMPLOYEE_DELETE_REQUEST'
     │
     ▼
[Antrean Approval Center Direktur]
     │
     ├───> OPSI A: DIREKTUR MENYETUJUI (APPROVE)
     │       │
     │       ├──> Eksekusi: [POST /employees/:id/soft-delete]
     │       ├──> Status Karyawan: is_deleted = true, status_kerja = 'NON_AKTIF'
     │       ├──> Penugasan aktif diakhiri (status = 'ENDED')
     │       ├──> Status Approval: 'APPROVED'
     │       └──> Log Audit Permanen: 'DIRECTOR_APPROVAL' & 'EMPLOYEE_SOFT_DELETE'
     │
     └───> OPSI B: DIREKTUR MENOLAK (REJECT)
             │
             ├──> Direktur menginput alasan penolakan
             ├──> Status Karyawan: pendingDelete = false (Karyawan tetap AKTIF)
             ├──> Status Approval: 'REJECTED' (dengan catatan rejectionReason)
             └──> Log Audit Permanen: 'DIRECTOR_REJECT'
```

---

## 5. Alur Penugasan & Rotasi Posko (Placement Lifecycle)
```text
Plotting Baru (POST /placements)
└── Status: ACTIVE (Mengikat Personil + Klien + Posko + Shift + Layanan)

Kebutuhan Pemindahan / Rotasi Lapangan:
└── POST /placements/:id/transfer
    ├── Penugasan Lama: status = 'ROTATED', tanggal_berakhir = NOW()
    ├── Penugasan Baru: status = 'ACTIVE' (Posko / Klien baru)
    └── Histori Mobilitas Karyawan terjaga utuh (karyawan tidak terikat permanen ke satu klien)
```

---

## 6. Alur Presensi Posko & Finalisasi Bulanan (Attendance Workflow)
```text
[Penugasan Aktif (Placements)]
     │ Membentuk formasi roster harian di setiap site klien
     ▼
[Presensi Harian Pos Jaga]
     │ Rekam jam masuk/pulang personil (PRESENT, LATE, ABSENT, ALPHA)
     ▼
[HRD Verifikasi & Koreksi]
     │ HRD hanya berwenang mengoreksi jam/alasan (tidak dapat mengubah formasi posko)
     ▼
[Finalisasi Akhir Bulan (HRD)]
     │ HRD mengeksekusi: [POST /attendance/finalize]
     ▼
[Lembar Absensi Terkunci (is_locked = true)]
     │ Seluruh rekaman absensi bulan tersebut dikunci permanen
     ▼
[Pengecualian Pembukaan Kunci (Reopen Exception)]
     │ Jika ada data tertinggal, HRD tidak dapat membuka sendiri
     │ Harus mengajukan permohonan dispensasi khusus ke Direktur
     │ Direktur mengeksekusi: [POST /attendance/reopen]
     └──> Log Audit mencatat alasan pembukaan kembali & aktor Direktur
```

---

## 7. Alur Pemenangan Tender Penjualan (Marketing WON Cascade)

Ketika sebuah peluang tender B2B berhasil dimenangkan, sistem memicu **Cascade Otomatis Lintas 4 Departemen**:

```text
[Website Inquiry / Form Kontak]
     │
     ▼
[Lead Masuk] ──> [Contacted] ──> [Qualified] ──> [Site Survey] ──> [Quotation Proposal] ──> [Negotiation]
     │
     ▼
[Status Ditandai: WON] (Deal Closed)
     │
     ├───────────────────────┬───────────────────────┬───────────────────────┐
     ▼                       ▼                       ▼                       ▼
1. MODUL LEGAL          2. MODUL FINANCE        3. MODUL OPERASIONAL    4. MODUL HRD
Menerbitkan draf        Membentuk profil akun   Mendaftarkan posko      Menerbitkan tiket
kontrak PKS baru        penagihan klien baru    jaga/lokasi baru        kuota formasi rekrutmen
(status: LEGAL_REVIEW)  & draf faktur uang muka (target kuota jaga)     & plotting personil
```

---

## 8. Alur Rekonsiliasi Kas Titipan COD & Eskalasi Hukum (COD Workflow)
```text
[Kurir Menyerahkan Titipan Kas COD]
     │
     ▼
[Staf Keuangan Memeriksa Setoran (Reconciliation)]
     │
     ├───> KONDISI A: Uang Kas Klop & Sesuai
     │       └──> Status: 'RECONCILED' (Uang masuk ke kas perusahaan)
     │
     └───> KONDISI B: Terjadi Selisih / Uang Tidak Disetorkan
             │
             ├──> Operasional melakukan klarifikasi lapangan ke kurir
             ├──> Jika dalam 3 hari tidak terselesaikan:
             │    Keuangan mengeksekusi: [POST /finance/cod/:id/escalate]
             │
             ▼
        [Eskalasi ke Bagian Legal]
             │ Kasus otomatis tercatat di tabel `legal_cases`
             │ Tim Legal menerbitkan Surat Somasi / Mediasi
             └──> Penyelesaian hukum (status: 'SETTLED' atau 'LEGAL_DISPUTE')
```

---

## 9. Alur Siklus Penggajian Karyawan (Payroll Lifecycle)
```text
[Presensi Posko Selesai Difinalisasi]
     │
     ▼
[HRD Review Kehadiran]
     │ Memastikan kalkulasi hari kerja, lembur, dan potongan absen
     ▼
[Finance Review (Maker)]
     │ Bagian Keuangan menyusun draf payroll: [POST /finance/payroll]
     │ Menghitung total gaji kotor, PPh 21, BPJS, dan take-home pay
     │ Status: 'FINANCE_REVIEW'
     ▼
[Pengajuan ke Direktur]
     │ Masuk ke antrean Approval Center Direktur
     ▼
[Director Approval (Checker)]
     │ Direktur meninjau ringkasan total dana & jumlah personil
     │ Direktur mengeksekusi: [POST /finance/payroll/:id/approve]
     │ Status: 'APPROVED'
     ▼
[Pencairan Dana (Disbursement)]
     │ Bagian Keuangan menginstruksikan transfer bank payroll
     └──> Status Akhir: 'PROCESSED'
```

---

## 10. Alur Penanganan Insiden Posko & Tiket IT Helpdesk
```text
Insiden Posko:
[Laporan Baru] ──> [Triage Tingkat Keparahan]
                         ├── Minor/Sedang → Diselesaikan Pengawas Lapangan → Status: RESOLVED
                         └── Berat/Kriminal → Eskalasi ke Legal & Direktur → Investigasi & Pelaporan Polsek

Tiket IT Helpdesk:
[Tiket Masuk (OPEN)] ──> [Ditugaskan Teknisi (ASSIGNED)] ──> [Pengerjaan (IN_PROGRESS)] ──> [Penyelesaian (RESOLVED)] ──> [Konfirmasi Pelapor (CLOSED)]
```

---

## 11. Matriks Kepemilikan Data Antar-Modul (Cross-Module Ownership)
| Entitas Data | Pemilik Utama (*Source of Truth*) | Konsumen (*Consumers*) |
|---|---|---|
| Karyawan (`employees`) | HRD | Operasional, Keuangan, Legal |
| Penugasan (`placements`) | Operasional | HRD, Keuangan, Direktur |
| Presensi (`attendance`) | HRD | Keuangan (Payroll), Operasional |
| Klien (`clients`) | Operasional / Komersial | Keuangan, Marketing, Direktur |
| Faktur Tagihan (`invoices`) | Keuangan | Direktur, Operasional |
| Kas Titipan COD (`cod_transactions`) | Keuangan | Operasional, Legal |
| Kontrak PKS & Sengketa (`legal_cases`) | Legal | Direktur, Keuangan |
| Prospek Penjualan (`leads`) | Marketing | Operasional, Keuangan |
| Tiket & Aset IT (`it_tickets`) | IT Support | Seluruh Departemen |
| Konten Publik (`cms`) | Admin Website | Pengunjung Situs Publik |
