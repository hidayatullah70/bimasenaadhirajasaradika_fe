# DEPARTMENT-INPUT-REPORTING-MATRIX.md — PT. BARAK IOMS
**Versi:** 2.0 (Authoritative Departmental Input, Output & Executive Reporting Matrix)  
**Tanggal:** 30 September 2026  
**Status:** COMPLETE, AUDITED, & BACKEND-READY  
**Dokumen Pendukung:** `docs/USER-FLOW.md`, `docs/PRD.md`, `docs/API-SPEC.md`, `05_WORKFLOW_CONTRACT.md`.

---

## 1. Filosofi & Arsitektur Aliran Data (Data Flow Architecture)

PT. BARAK IOMS menerapkan prinsip **Isolasi Pintu Masuk Data (Decoupled Input)** dan **Agregasi Visibilitas Eksekutif 360 Derajat (Executive Aggregation)**:

1. **Pintu Input Mandiri (*Input Isolation*):** Setiap staf bagian hanya memiliki akses formulir input sesuai lingkup tugas fungsional divisinya.
2. **Output Operasional Divisi (*Local Visibility*):** Data yang diinput langsung memutakhirkan tabel operasional dan indikator dashboard lokal pada modul bagian yang bersangkutan.
3. **Aliran Pelaporan ke Direktur (*Upstream Executive Stream*):** Seluruh input dari divisi-divisi operasional bermuara secara terintegrasi ke 4 subsistem di menu Direktur (`/ops/director/*`):
   - **Cockpit Dashboard (`/ops/director`):** Kartu analitik KPI agregat lintas divisi dihitung secara dinamis.
   - **Approval Center (`/ops/director/approvals`):** Antrean verifikasi terpusat untuk 8 jenis permohonan mutasi penting.
   - **Risk Alerts (`/ops/director/alerts`):** Peringatan bahaya dini otomatis (insiden kritis, posko *understaffed*, kontrak akan habis).
   - **Executive Reports (`/ops/director/reports`):** Laporan rekapitulasi strategis komprehensif.

```text
[1. HRD]          ──> Presensi & Master Personil   ──┐
[2. Operasional]  ──> Penugasan Posko & Insiden    ──┤
[3. Keuangan]     ──> Faktur, Kas COD & Payroll    ──┼──> [MENU DIREKTUR]
[4. Legal]        ──> Kontrak PKS & Sengketa       ──┤     ├── 1. Cockpit Dashboard (KPI Lintas Divisi)
[5. Marketing]    ──> Prospek, Pipeline & Tender   ──┤     ├── 2. Approval Center (Pusat 8 Persetujuan)
[6. IT Support]   ──> Tiket SLA & Aset Posko       ──┤     ├── 3. Risk Alerts (Peringatan Risiko)
[7. Admin Web]    ──> Lowongan Karir & Kontak Web  ──┘     └── 4. Executive Reports (Laporan Analitik)
```

---

## 2. Pemetaan Lengkap per Departemen

### 2.1 Bagian HRD (Human Resources Department)

| Aspek | Komponen / Rute Antarmuka | Rincian Entitas Data & Aksi Input |
|---|---|---|
| **Menu Input Awal** | - `/ops/master/employees` $\rightarrow$ Modal `EmployeeFormModal`<br>- `/ops/hrd/attendance-spreadsheet`<br>- `/ops/hrd/attendance-spreadsheet` $\rightarrow$ Tombol *"Finalisasi"*<br>- `/ops/master/employees` $\rightarrow$ Modal `DeleteRequestModal` | 1. **Registrasi Personil Baru:** Input Nama Lengkap, NIK 16 digit, gender, layanan, jabatan, BPJS, NPWP, foto KTP.<br>2. **Presensi Harian Posko:** Input jam masuk (*check-in*) dan jam pulang (*check-out*) aktual personil posko jaga.<br>3. **Finalisasi Lembar Absensi:** Mengunci permanen lembar absensi bulanan posko (`status: FINALIZED`).<br>4. **Pengajuan Nonaktif/Hapus:** Mengajukan permohonan terminasi/soft-delete karyawan beserta alasan tertulis ke Direktur. |
| **Output di Menu HRD** | - `/ops/hrd` (Dashboard HRD)<br>- `/ops/master/employees` (Daftar Karyawan)<br>- `/ops/hrd/attendance-summary` (Rekapitulasi Gaji)<br>- `/ops/hrd/contracts` (Monitoring PKWT) | - Metrik real-time: Total Personil Aktif, Rata-rata Kehadiran Posko (%), Jam Lembur, Kontrak PKWT Menjelang Kedaluwarsa.<br>- Tabel master karyawan dengan pencarian filter, status kerja, dan drawer detail profil.<br>- Lembar rekapitulasi absensi bulanan yang siap dikonsumsi Keuangan untuk penggajian. |
| **Aliran ke Menu Direktur** | - `/ops/director` (Cockpit)<br>- `/ops/director/approvals` (Approval Center)<br>- `/ops/director/reports` (Executive Reports) | - **Kartu KPI Cockpit:** *"Total Personil Aktif"* dan *"Tingkat Kehadiran Personil (%)"*.<br>- **Pusat Persetujuan Direktur:**<br>&nbsp;&nbsp;• `EMPLOYEE_DELETE`: Pengajuan hapus karyawan wajib diverifikasi Direktur sebelum dieksekusi soft-delete.<br>&nbsp;&nbsp;• `ATTENDANCE_REOPEN`: Pembukaan kembali lembar presensi yang telah dikunci hanya dapat dilakukan oleh Direktur.<br>- **Executive Reports:** Rekapitulasi Produktivitas SDM & Kepatuhan Absensi Posko. |

---

### 2.2 Bagian Operasional (Field Operations)

| Aspek | Komponen / Rute Antarmuka | Rincian Entitas Data & Aksi Input |
|---|---|---|
| **Menu Input Awal** | - `/ops/master/assignments` $\rightarrow$ Modal `AssignmentFormModal`<br>- `/ops/master/assignments` $\rightarrow$ Modal `AssignmentTransferModal`<br>- `/ops/operations/incidents` $\rightarrow$ Tombol *"Lapor Insiden"*<br>- `/ops/operations/replacements` $\rightarrow$ Tombol *"Ajukan Pengganti"*<br>- `/ops/operations/field-reports` $\rightarrow$ Tombol *"Unggah Laporan"* | 1. **Plotting Penugasan:** Memasangkan personil ke posko klien, jadwal shift jaga, dan jabatan posko.<br>2. **Rotasi / Pindah Tugas:** Memindahkan personil (penugasan lama otomatis `ROTATED`, penugasan baru menjadi `ACTIVE`).<br>3. **Lapor Insiden Lapangan:** Input posko kejadian, tingkat keparahan (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), kronologi kejadian.<br>4. **Tiket Personil Cadangan (*Replacement*):** Mengajukan personil pengganti darurat jika ada personil yang berhalangan jaga.<br>5. **Jurnal Patroli Harian:** Input laporan kegiatan patroli keamanan dan pemeriksaan posko. |
| **Output di Menu Operasional** | - `/ops/operations` (Dashboard Operasional)<br>- `/ops/operations/manpower` (Manpower Readiness)<br>- `/ops/operations/incidents` (Register Insiden)<br>- `/ops/master/assignments` (Daftar Penugasan) | - Indikator *Manpower Readiness Rate (%)*, Status Kuota Penempatan Posko Jaga, Total Insiden Terbuka, Tiket Penggantian Pending.<br>- Matriks ketersediaan personil per klien dan posko (analisis kekurangan personil vs kuota kontrak).<br>- Log penanganan insiden posko dari tahap investigasi hingga resolusi. |
| **Aliran ke Menu Direktur** | - `/ops/director` (Cockpit)<br>- `/ops/director/alerts` (Risk Alerts)<br>- `/ops/director/approvals` (Approval Center) | - **Kartu KPI Cockpit:** *"Kesiapan Personel Lapangan (Readiness Rate %)"* dan *"Insiden Kritis Terbuka"*.<br>- **Peringatan Risiko (*Risk Alerts*):** Notifikasi otomatis jika terdapat posko yang kekurangan personil (*understaffed*) atau terjadi insiden tingkat `CRITICAL`.<br>- **Pusat Persetujuan Direktur:** Tiket `OPERATIONAL_REQUEST` untuk permohonan personil cadangan atau dispensasi kuota posko. |

---

### 2.3 Bagian Keuangan (Finance & Accounting)

| Aspek | Komponen / Rute Antarmuka | Rincian Entitas Data & Aksi Input |
|---|---|---|
| **Menu Input Awal** | - `/ops/finance/invoices` $\rightarrow$ Tombol *"Terbitkan Faktur"*<br>- `/ops/finance/invoices` $\rightarrow$ Aksi *"Rekam Pembayaran"*<br>- `/ops/finance/payroll` $\rightarrow$ Tombol *"Buat Periode Gaji"* (Maker)<br>- `/ops/finance/cod` $\rightarrow$ Aksi *"Rekonsiliasi Setoran"* | 1. **Penerbitan Faktur (*Invoice*):** Input nomor faktur, klien, periode tagihan, termin, PPN, nominal tagihan, tanggal jatuh tempo.<br>2. **Rekam Pembayaran Faktur:** Input tanggal bayar, nominal masuk, metode transfer bank, nomor referensi.<br>3. **Penyusunan Draf Payroll (Maker):** Menghitung total gaji kotor, jam lembur dari absensi HRD, potongan BPJS, PPh 21, dan take-home pay.<br>4. **Rekonsiliasi Kas Titipan COD Kurir:** Input nominal setoran kas kurir, nomor slip bank, dan pencatatan selisih kas titipan. |
| **Output di Menu Keuangan** | - `/ops/finance` (Dashboard Keuangan)<br>- `/ops/finance/invoices` (Daftar Faktur Tagihan)<br>- `/ops/finance/payroll` (Daftar Periode Penggajian)<br>- `/ops/finance/cod` (Monitoring Kas Titipan COD) | - Ringkasan Total Piutang Berjalan (*Accounts Receivable*), Arus Kas Masuk (*Net Cash Flow*), Faktur Jatuh Tempo (*Overdue*), Kas Titipan COD Kurir Belum Disetor.<br>- Status faktur (`DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`).<br>- Status periode penggajian (`DRAFT`, `FINANCE_REVIEW`, `APPROVED`, `PROCESSED`). |
| **Aliran ke Menu Direktur** | - `/ops/director` (Cockpit)<br>- `/ops/director/approvals` (Approval Center)<br>- `/ops/director/reports` (Executive Reports) | - **Kartu KPI Cockpit:** *"Total Revenue Bulanan"*, *"Arus Kas Bersih (Net Cash Flow)"*, dan *"Total Piutang Tertagih"*.<br>- **Pusat Persetujuan Direktur (*Maker-Checker*):**<br>&nbsp;&nbsp;• `PAYROLL`: Draf gaji yang disusun Finance **wajib disetujui Direktur** sebelum dana ditransfer ke rekening personil.<br>&nbsp;&nbsp;• `EXPENSE_APPROVAL`: Otorisasi pengeluaran kas operasional / belanja modal posko (CAPEX).<br>- **Executive Reports:** Laporan Arus Kas Konsolidasi dan Analisis Umur Piutang (*Aging Receivables*). |

---

### 2.4 Bagian Legal & Kepatuhan (Legal & Compliance)

| Aspek | Komponen / Rute Antarmuka | Rincian Entitas Data & Aksi Input |
|---|---|---|
| **Menu Input Awal** | - `/ops/legal/contracts` $\rightarrow$ Tombol *"Registrasi Kontrak"*<br>- `/ops/legal/cases` $\rightarrow$ Tombol *"Buka Kasus"*<br>- `/ops/legal/compliance` $\rightarrow$ Form Kepatuhan Regulasi | 1. **Registrasi Kontrak PKS Klien:** Input nomor PKS, klien, masa berlaku (mulai - selesai), nilai kontrak, lampiran SLA, klausul penalti.<br>2. **Buka Berkas Perkara / Sengketa COD:** Menerima eskalasi selisih dana COD dari Keuangan atau sengketa klien $\rightarrow$ input identitas terlapor, somasi, barang bukti.<br>3. **Pembaruan Izin Regulasi:** Input masa berlaku Surat Izin Operasional (SIO) Mabes Polri, KTA Satpam, dan BPJS Ketenagakerjaan. |
| **Output di Menu Legal** | - `/ops/legal` (Dashboard Legal)<br>- `/ops/legal/contracts` (Monitoring PKS Klien)<br>- `/ops/legal/cases` (Register Perkara Hukum)<br>- `/ops/legal/compliance` (Indeks Kepatuhan SIO) | - Ringkasan PKS Aktif, Kontrak Menjelang Kedaluwarsa (< 60 hari), Berkas Perkara Berjalan, dan Indeks Kepatuhan Regulasi (%).<br>- Status kontrak (`DRAFT`, `LEGAL_REVIEW`, `APPROVED`, `SIGNED`, `ACTIVE`, `EXPIRING`, `EXPIRED`).<br>- Log penanganan sengketa dari somasi hingga mediasi. |
| **Aliran ke Menu Direktur** | - `/ops/director` (Cockpit)<br>- `/ops/director/alerts` (Risk Alerts)<br>- `/ops/director/approvals` (Approval Center) | - **Kartu KPI Cockpit:** *"Tingkat Kepatuhan Regulasi SIO BUJP (%)"* dan *"Kasus Hukum Aktif"*.<br>- **Peringatan Risiko (*Risk Alerts*):** Peringatan otomatis untuk kontrak PKS bernilai besar yang akan habis dalam waktu 30–60 hari atau masa berlaku SIO Polri yang mendekati tenggat.<br>- **Pusat Persetujuan Direktur:** Tiket `CONTRACT_APPROVAL` untuk otorisasi dan pengesahan draf PKS klien baru sebelum penandatanganan. |

---

### 2.5 Bagian Marketing & Komersial

| Aspek | Komponen / Rute Antarmuka | Rincian Entitas Data & Aksi Input |
|---|---|---|
| **Menu Input Awal** | - `/ops/marketing/leads` $\rightarrow$ Modal `LeadFormModal`<br>- `/ops/marketing/pipeline` $\rightarrow$ Stage Mover<br>- `/ops/marketing/handover` $\rightarrow$ Tombol *"Tandai WON"* | 1. **Input Prospek Klien (Leads):** Input nama korporat, PIC, nomor telepon, email, kebutuhan unit layanan, estimasi kuota personil.<br>2. **Pipeline Tender & Negosiasi:** Memindahkan tahapan penjualan (`CONTACTED` $\rightarrow$ `QUALIFIED` $\rightarrow$ `SURVEY` $\rightarrow$ `QUOTED` $\rightarrow$ `NEGOTIATION`).<br>3. **Serah Terima Pemenangan (*Handover Cascade*):** Menandai tender `WON` $\rightarrow$ otomatis memicu pembuatan draf kontrak Legal, akun Finance, dan posko Operasional. |
| **Output di Menu Marketing** | - `/ops/marketing` (Dashboard Marketing)<br>- `/ops/marketing/leads` (Tabel Prospek CRM)<br>- `/ops/marketing/pipeline` (Pipeline Penjualan)<br>- `/ops/marketing/handover` (Serah Terima Klien) | - Indikator Prospek Baru, Nilai Total Pipeline Negosiasi (Rp), Rasio Kemenangan (*Win Rate %*), Prospek per Layanan.<br>- Tabel prospek masuk dari form publik web dan B2B sales.<br>- Monitoring serah terima klien baru ke departemen terkait. |
| **Aliran ke Menu Direktur** | - `/ops/director` (Cockpit)<br>- `/ops/director/approvals` (Approval Center)<br>- `/ops/director/reports` (Executive Reports) | - **Kartu KPI Cockpit:** *"Estimasi Nilai Pipeline Komersial (Deal Value)"* dan *"Klien Baru Dimenangkan (YTD)"*.<br>- **Pusat Persetujuan Direktur:** Tiket `QUOTATION_APPROVAL` untuk persetujuan diskon atau struktur penawaran harga tender besar.<br>- **Executive Reports:** Analisis Konversi Pasar, Pertumbuhan Bisnis, dan Prospek Klien Korporat. |

---

### 2.6 Bagian IT Support & Aset Posko

| Aspek | Komponen / Rute Antarmuka | Rincian Entitas Data & Aksi Input |
|---|---|---|
| **Menu Input Awal** | - `/ops/it/tickets` $\rightarrow$ Modal `TicketFormModal`<br>- `/ops/it/assets` $\rightarrow$ Tombol *"Tambah Aset"*<br>- `/ops/it/maintenance` $\rightarrow$ Tombol *"Jadwalkan Pemeliharaan"* | 1. **Input Tiket Gangguan IT:** Input laporan kendala teknis (Radio HT posko, tablet absensi, CCTV posko, jaringan), posko klien, prioritas (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).<br>2. **Pencatatan Aset IT Posko:** Input kode aset, nama perangkat (Radio HT Motorola, Tablet Samsung posko), nomor seri, status kondisi fisik.<br>3. **Jadwal Servis Preventif:** Menjadwalkan kalibrasi dan pemeliharaan berkala perangkat posko jaga. |
| **Output di Menu IT Support** | - `/ops/it` (Dashboard IT Support)<br>- `/ops/it/tickets` (Helpdesk Tiket IT)<br>- `/ops/it/assets` (Inventaris Aset Posko)<br>- `/ops/it/maintenance` (Jadwal Maintenance) | - Indikator *SLA Response Rate (%)*, Total Tiket Terbuka, Aset Beroperasi Normal (%), Jadwal Pemeliharaan Mendatang.<br>- Status penyelesaian tiket helpdesk (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`). |
| **Aliran ke Menu Direktur** | - `/ops/director` (Cockpit)<br>- `/ops/director/alerts` (Risk Alerts)<br>- `/ops/director/activity` (Audit Trail) | - **Kartu KPI Cockpit:** *"Kepatuhan SLA Sistem & Dukungan Posko (%)"*.<br>- **Peringatan Risiko (*Risk Alerts*):** Peringatan otomatis jika tiket infrastruktur bernilai kritis (*CRITICAL*) melampaui batas waktu penyelesaian SLA.<br>- **Audit Log Direktur:** Riwayat integritas sistem dan pemeliharaan server/jaringan. |

---

### 2.7 Bagian Admin Website / CMS Publik

| Aspek | Komponen / Rute Antarmuka | Rincian Entitas Data & Aksi Input |
|---|---|---|
| **Menu Input Awal** | - `/ops/website/articles` $\rightarrow$ Modal `ArticleFormModal`<br>- `/ops/website/careers` $\rightarrow$ Modal `CareerFormModal`<br>- `/ops/website/faqs` & `/ops/website/seo` | 1. **Publikasi Berita & Warta:** Input judul artikel, kategori berita, isi konten, unggah gambar thumbnail, status terbit.<br>2. **Penerbitan Lowongan Karir:** Input posisi lowongan (Satpam, Driver Kurir, Cleaning Service), kualifikasi syarat, batas kuota.<br>3. **Pusat FAQ & Pengaturan SEO:** Input tanya jawab resmi dan konfigurasi metadata Google. |
| **Output di Menu Admin Website** | - `/ops/website` (Dashboard Website)<br>- `/ops/website/articles` (Manajemen Berita)<br>- `/ops/website/careers` (Lowongan Kerja Terbit)<br>- `/ops/website/inquiries` (Pesan Masuk Tamu) | - Metrik Total Artikel Terbit, Lowongan Aktif, Lamaran Masuk, dan Skor SEO.<br>- Kotak masuk pesan konsultasi pengunjung web publik (otomatis diteruskan ke bagian Marketing). |
| **Aliran ke Menu Direktur** | - `/ops/director/reports` (Executive Reports) | - **Executive Reports:** Analisis efektivitas kanal digital publik dan volume rekrutmen pelamar tenaga kerja. |

---

### 2.8 Master Data Terpadu (Fondasi Bersama Seluruh Bagian)

Dikelola bersama di bawah kendali Admin, HRD, dan Direktur pada rute `/ops/master/*`:
- **Master Karyawan (`/ops/master/employees`):** Pusat biodata dan profil personil seluruh Indonesia.
- **Master Klien (`/ops/master/clients`):** Daftar 18 klien resmi PT. BARAK (`CLI-000001` s/d `CLI-000018`).
- **Master Posko / Lokasi (`/ops/master/locations`):** Posko pengamanan, kuota jaga personil, koordinat GPS.
- **Master Shift (`/ops/master/shifts`):** Standar jam kerja posko (Shift 1, Shift 2, Shift 3).
- **Master Penugasan (`/ops/master/assignments`):** Formasi penempatan personil aktif dan riwayat rotasi.
- **Master Pengguna (`/ops/master/users`):** Akun login sistem untuk 8 peran internal.

---

## 3. Struktur Pengawasan Eksekutif pada Menu Direktur (`/ops/director/*`)

Semua data dari seluruh divisi operasional di atas teragregasi secara otomatis pada 5 menu utama Direktur:

### 3.1 Cockpit Dashboard Eksekutif (`/ops/director`)
Menampilkan 6 kartu KPI dinamis lintas departemen yang dihitung secara *real-time* tanpa angka statis:
1. **Total Personil Aktif:** Dihitung dari `employees` berstatus aktif (HRD).
2. **Kesiapan Personel Lapangan (Readiness Rate %):** Dihitung dari kuota `placements` posko terpenuhi (Operasional).
3. **Total Revenue Bulanan:** Dihitung dari akumulasi `invoices` diterbitkan (Keuangan).
4. **Arus Kas Bersih (Net Cash Flow):** Dihitung dari pembayaran masuk dikurangi pengeluaran operasional (Keuangan).
5. **Estimasi Nilai Pipeline Komersial:** Dihitung dari total nilai negosiasi tender `opportunities` (Marketing).
6. **Kepatuhan Regulasi SIO BUJP (%):** Dihitung dari masa berlaku izin legalitas dan SIO Mabes Polri (Legal).

### 3.2 Pusat Persetujuan Terpadu (`/ops/director/approvals`)
Menjadi gerbang tunggal otorisasi bagi Direktur untuk 8 jenis permohonan penting:
- `EMPLOYEE_DELETE`: Pengajuan hapus personil dari HRD.
- `EMPLOYEE_STATUS_CHANGE`: Pengangkatan PKWT ke Karyawan Tetap dari HRD.
- `PAYROLL`: Otorisasi pencairan gaji bulanan dari Keuangan (*Maker-Checker*).
- `EXPENSE_APPROVAL`: Otorisasi pengeluaran belanja modal posko (CAPEX) dari Keuangan.
- `CONTRACT_APPROVAL`: Persetujuan draf PKS klien baru dari Legal.
- `QUOTATION_APPROVAL`: Persetujuan diskon atau tarif khusus tender dari Marketing.
- `OPERATIONAL_REQUEST`: Dispensasi personil cadangan atau formasi dari Operasional.
- `ATTENDANCE_REOPEN`: Pembukaan kembali lembar presensi yang telah dikunci dari HRD.

Setiap aksi **Setujui (*Approve*)** mengeksekusi mutasi model terkait di database. Setiap aksi **Tolak (*Reject*)** mewajibkan input alasan tertulis dan memulihkan status data pemohon.

### 3.3 Peringatan Risiko Dini (`/ops/director/alerts`)
Sistem peringatan otomatis yang mendeteksi anomali operasional:
- Posko kekurangan personil (*understaffed*) > 10%.
- Laporan insiden posko berkategori bahaya tinggi (`CRITICAL`).
- Kontrak PKS Klien bernilai besar yang akan kedaluwarsa dalam 30–60 hari.
- Faktur tagihan klien yang menunggak (*OVERDUE*) melampaui batas toleransi.

### 3.4 Laporan Eksekutif Strategis (`/ops/director/reports`)
Menyediakan rekapitulasi analitik terpadu:
- Rekapitulasi Produktivitas SDM & Kepatuhan Presensi Posko (HRD & Operasional).
- Ringkasan Arus Kas, Pendapatan, dan Umur Piutang (Keuangan).
- Evaluasi Kepatuhan Hukum & Sengketa COD (Legal).
- Analisis Konversi Pasar & Serah Terima Klien Menang (Marketing).

### 3.5 Jejak Audit Permanen (`/ops/director/activity` / `/ops/audit`)
Mencatat seluruh mutasi kritis secara *append-only* (siapa aktor yang melakukan mutasi, peran, waktu ISO, modul, ID rekaman, dan deskripsi perubahan).
