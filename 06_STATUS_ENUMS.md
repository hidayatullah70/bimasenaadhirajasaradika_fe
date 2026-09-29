# 06_STATUS_ENUMS.md — PT. BARAK IOMS
**Versi:** 2.0 (Authoritative Lifecycle State Enums)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Ruang Lingkup:** Enum Status Seragam & Diagram Transisi Siklus Hidup Entitas

---

## 1. Definisi Enum Status Utama (Core Status Enums)

Seluruh modul frontend dan backend **wajib** menggunakan nilai literal enum berikut secara konsisten. Nilai enum disimpan dalam huruf kapital (*uppercase*) pada database.

---

### 1.1 Karyawan & Personil (`EmployeeStatus`)
Mencerminkan siklus hidup personil dari tahap pelamar hingga purna tugas:
- `APPLICANT`: Berkas lamaran masuk dari portal karir web.
- `ONBOARDING`: Lolos seleksi, melengkapi berkas KTP, SKCK, & sertifikasi.
- `ACTIVE`: Personel resmi siap tugas di pool internal.
- `PLACED`: Personel sedang ditempatkan pada pos penugasan aktif klien.
- `TRANSFERRED`: Sedang dalam proses pemindahan/rotasi antar site posko.
- `ON_LEAVE`: Sedang cuti resmi atau izin sakit.
- `TERMINATED`: Pengakhiran hubungan kerja / purna tugas.
- `INACTIVE`: Karyawan dinonaktifkan / disoft-delete pasca otorisasi Direktur.

```
[APPLICANT] ──> [ONBOARDING] ──> [ACTIVE] ──> [PLACED] <──> [TRANSFERRED]
                                    │            │
                                    ├──> [ON_LEAVE]
                                    │
                                    └──> [TERMINATED] / [INACTIVE]
```

---

### 1.2 Penugasan & Posko (`PlacementStatus`)
Mengatur penempatan personil di posko klien:
- `REQUESTED`: Permohonan penempatan diajukan oleh Danru / Klien.
- `APPROVED`: Plotting personil disetujui Operasional.
- `SCHEDULED`: Jadwal shift jaga telah diplot pada kalender posko.
- `ACTIVE`: Personel bertugas aktif di pos jaga saat ini.
- `ROTATED`: Penugasan lama ditutup karena personil dirotasi ke posko baru.
- `ENDED`: Penugasan selesai atau ditarik dari posko klien.

```
[REQUESTED] ──> [APPROVED] ──> [SCHEDULED] ──> [ACTIVE] ──> [ROTATED]
                                                  │
                                                  └──> [ENDED]
```

---

### 1.3 Perjanjian Kerja Sama Korporat (`ContractStatus`)
Siklus kontrak legal B2B dengan mitra bisnis:
- `DRAFT`: Draf awal klausul kerja sama pengamanan/outsourcing.
- `LEGAL_REVIEW`: Evaluasi hukum, penyesuaian SLA, dan batasan tanggung jawab.
- `APPROVED`: Otorisasi eksekutif oleh Direktur.
- `SIGNED`: Dokumen telah ditandatangani basah / digital kedua belah pihak.
- `ACTIVE`: Masa berlaku kontrak berjalan aktif.
- `EXPIRING`: Masa berlaku tersisa $\le$ 60 hari (memicu peringatan renegosiasi).
- `RENEWED`: Kontrak diperpanjang dengan adendum baru.
- `EXPIRED`: Masa kontrak berakhir tanpa perpanjangan.

```
[DRAFT] ──> [LEGAL_REVIEW] ──> [APPROVED] ──> [SIGNED] ──> [ACTIVE] ──> [EXPIRING] ──> [RENEWED]
                                                              │                         │
                                                              └─────────────────────────┴──> [EXPIRED]
```

---

### 1.4 Prospek & Peluang Penjualan (`LeadStage`)
Tahapan konversi tender dari inquiry web hingga pemenangan:
- `NEW`: Pesan masuk baru dari form kontak / hotline WhatsApp.
- `CONTACTED`: Tim marketing telah menghubungi perwakilan prospek.
- `QUALIFIED`: Kebutuhan layanan dan estimasi personil tervalidasi.
- `SURVEY`: Tim operasional melakukan survei fisik ke lokasi klien.
- `QUOTED`: Proposal penawaran harga resmi (Quotation) terkirim.
- `NEGOTIATION`: Tahap penyesuaian terms harga dan SLA pengamanan.
- `WON`: Tender berhasil dimenangkan (memicu cascade lintas divisi).
- `LOST`: Prospek membatalkan atau memilih kompetitor lain.

```
[NEW] ──> [CONTACTED] ──> [QUALIFIED] ──> [SURVEY] ──> [QUOTED] ──> [NEGOTIATION] ──> [WON]
   │           │              │             │            │               │
   └───────────┴──────────────┴─────────────┴────────────┴───────────────┴──────────> [LOST]
```

---

### 1.5 Faktur Tagihan Outsourcing (`InvoiceStatus`)
Siklus penagihan dan piutang klien:
- `DRAFT`: Draf tagihan disusun berdasarkan kalkulasi penugasan dan absensi.
- `ISSUED`: Faktur resmi diterbitkan dan dikirimkan ke bagian finance klien.
- `PARTIALLY_PAID`: Pembayaran termin diterima sebagian.
- `PAID`: Pelunasan 100% diterima dan dikonfirmasi via bukti transfer.
- `OVERDUE`: Melewati batas jatuh tempo pembayaran (`due_date`).
- `VOID`: Faktur dibatalkan karena revisi klausul atau kesalahan penagihan.

```
[DRAFT] ──> [ISSUED] ──> [PARTIALLY_PAID] ──> [PAID]
               │
               ├──> [OVERDUE] ──> [PAID]
               │
               └──> [VOID]
```

---

### 1.6 Insiden Lapangan (`IncidentStatus`)
- `OPEN`: Laporan insiden baru masuk dari posko jaga.
- `INVESTIGATING`: Tim patroli / Danru sedang melakukan olah TKP.
- `ESCALATED`: Insiden diteruskan ke tingkat Manajemen / Polsek setempat / Legal.
- `RESOLVED`: Insiden telah diselesaikan dan laporan investigasi diarsipkan.

---

### 1.7 Pusat Persetujuan Eksekutif (`ApprovalStatus`)
- `PENDING`: Permohonan menunggu peninjauan Direktur.
- `APPROVED`: Direktur menyetujui; mutasi data primer dieksekusi secara otomatis.
- `REJECTED`: Direktur menolak permohonan dengan catatan alasan tertulis.

---

### 1.8 Tiket Gangguan IT (`TicketStatus`)
- `OPEN`: Tiket kendala teknis perangkat posko terdaftar.
- `IN_PROGRESS`: Staf IT sedang melakukan penanganan / perbaikan remote.
- `RESOLVED`: Perangkat kembali berfungsi normal.
- `CLOSED`: Tiket ditutup setelah konfirmasi pengguna posko.
