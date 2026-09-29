# 05_WORKFLOW_CONTRACT.md — PT. BARAK IOMS
**Versi:** 2.0 (Interconnected Cross-Department Workflows)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Ruang Lingkup:** Standar Alur Bisnis Operasional Lintas Departemen

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

## 2. Alur Presensi Posko & Finalisasi Bulanan (Attendance Workflow)

```
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
     │ Harus mengajukan dispensasi khusus ke Direktur
     │ Direktur mengeksekusi: [POST /attendance/reopen]
     └──> Log Audit mencatat alasan pembukaan kembali & aktor Direktur
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
