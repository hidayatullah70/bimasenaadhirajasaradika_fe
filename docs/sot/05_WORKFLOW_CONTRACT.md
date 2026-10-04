# 05_WORKFLOW_CONTRACT.md — PT. BARAK IOMS
**Versi:** 2.1 (Interconnected Cross-Department Workflows)  
**Tanggal:** 4 Oktober 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Ruang Lingkup:** Standar Alur Bisnis Operasional Lintas Departemen, Presensi Posko & Impor Massal

---

## 1. Alur Penghapusan & Nonaktif Personil (Employee Deletion Workflow)

Mencegah penghapusan sepihak atau kehilangan data historis personil pengamanan:

```
[HRD / Staf]
     │ Mengajukan Permohonan Hapus (input alasan)
     ▼
[POST /employees/:id/delete-request]
     │
     ├──> Karyawan ditandai: pendingDelete = true
     ├──> Backend menerbitkan rekaman di tabel `approvals`:
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
             ├──> Status Approval: 'REJECTED' (dengan rejectionReason)
             └──> Log Audit Permanen: 'DIRECTOR_REJECT'
```

---

## 2. Alur Presensi Posko, Sinkronisasi Lokasi & Siklus Sesi Inputer (Attendance Workflow)

Alur terintegrasi antara penugasan personil, pencatatan jam kerja lapangan, format ekspor formal, serta pembersihan sesi kerja petugas:

```
[Petugas Memilih Dropdown "Klien" & "Lokasi Penempatan"]
     │
     ▼
[Query Penugasan Aktif: GET /placements?clientId=X&location=Y&status=ACTIVE]
     │
     ├───> KONDISI A: Ada Data Karyawan Aktif
     │       │
     │       ├──> Otomatis tampilkan daftar nama personil pada kolom "Nama Karyawan"
     │       ├──> Siapkan kolom "Datang", "Pulang", dan "Lembur" dalam keadaan kosong
     │       ├──> Petugas Lapangan / Inputer menginput jam kerja secara manual
     │       └──> Opsi Ekspor Excel: Menerbitkan .xlsx dengan Kop Resmi Perusahaan
     │            (Nama Klien, Lokasi, Periode, Tanggal Cetak, Petugas Inputer)
     │
     └───> KONDISI B: Belum Ada Data Karyawan pada Lokasi Tersebut
             │
             └──> Sistem menampilkan notifikasi:
                  "Data Karyawan pada lokasi klien ini masih kosong"
                  (Petugas diarahkan untuk melakukan plotting / impor data karyawan)
     │
     ▼
[HRD Verifikasi & Finalisasi Bulanan]
     │ HRD mengeksekusi: [POST /attendance/finalize]
     ▼
[Lembar Absensi Terkunci (is_locked = true)]
     │ Seluruh rekaman absensi bulan tersebut dikunci permanen
     ▼
[Pengecualian Pembukaan Kunci (Reopen Exception)]
     │ Jika ada data tertinggal, HRD tidak dapat membuka sendiri
     │ Harus mengajukan dispensasi khusus ke Direktur
     │ Direktur mengeksekusi: [POST /attendance/reopen]
     └──> Log Audit mencatat alasan pembukaan kembali & aktor Direktur

[Siklus Sesi Petugas Inputer (user1 / user2 Logout)]
     │ Saat petugas inputer menekan tombol Logout:
     ├──> Riwayat draf kerja aktif ("Lembar Tersedia") dibersihkan dari penyimpanan sesi
     └──> Login berikutnya dimulai dengan lembar kerja bersih dan siap untuk tugas baru
```

---

## 3. Alur Pemenangan Tender Penjualan (Marketing WON Cascade)

Ketika sebuah peluang tender B2B berhasil dimenangkan, sistem memicu **Cascade Otomatis Lintas 4 Departemen**:

```
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

## 4. Alur Rekonsiliasi Kas Titipan COD & Eskalasi Hukum (COD Workflow)

```
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

## 5. Alur Penggajian Karyawan (Payroll Lifecycle)

```
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

## 6. Alur Impor Karyawan Massal Excel & Penugasan Atomik (Bulk Employee Import Workflow)

Menjamin personil yang diimpor langsung tersinkronisasi ke penugasan posko klien tanpa perlu entri penempatan satu per satu:

```
[HRD Membuka Modal "Import Excel (.xlsx)"]
     │
     ├──> HRD mengunduh template resmi: Template_Import_Karyawan_BARAK.xlsx
     │    (Kolom: NIK, Nama Lengkap, Jabatan, Divisi, Telepon, Email, Join Date, Gaji, Status, Bank, Rekening)
     │
     ├──> HRD memilih "Nama Klien" (dari 18 Mitra Riil) dan "Lokasi Penempatan"
     │
     ▼
[Unggah Berkas .xlsx & Validasi Frontend]
     │ Sistem membaca baris data:
     │ - Validasi NIK unik 16 digit
     │ - Validasi kelengkapan nama dan jabatan
     │
     ▼
[Eksekusi Impor: POST /employees/import]
     │
     ├──> 1. Simpan Data Personil ke Tabel `employees`
     │
     ├──> 2. TERBITKAN PENUGASAN AKTIF OTOMATIS ke Tabel `placements`:
     │       - client_id = Klien Terpilih
     │       - site_id / location = Lokasi Penempatan Terpilih
     │       - status = 'ACTIVE'
     │       - is_current = true
     │       - start_date = join_date personil
     │
     └──> 3. Catat Riwayat Mutasi ke Tabel `audit_logs`
     │
     ▼
[Sinkronisasi Instan Lintas Modul]
     ├──> Jumlah karyawan pada kartu analitik & daftar master bertambah
     └──> Saat membuka menu "Attendance Spreadsheet" dengan Klien & Lokasi tersebut,
          seluruh nama karyawan yang diimpor langsung otomatis muncul di lembar presensi.
```

