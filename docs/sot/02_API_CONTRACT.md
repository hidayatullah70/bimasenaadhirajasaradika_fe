# 02_API_CONTRACT.md — PT. BARAK IOMS
**Versi:** 2.0 (REST Specification & Payload Envelope)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Ruang Lingkup:** Kontrak Komunikasi HTTP REST Frontend $\leftrightarrow$ Backend

---

## 1. Format Amplop Respons Standar (Standard Response Envelopes)

Semua endpoint API backend **wajib** mengembalikan respons JSON dalam struktur amplop (*envelope*) standar berikut. Frontend telah dikonfigurasikan untuk mengonsumsi format ini secara konsisten melalui `src/services/apiClient.js`.

### 1.1 Respons Sukses Rekaman Tunggal / Mutasi (Single Entity Response)
```json
{
  "success": true,
  "data": {
    "id": "BRK-EMP-001",
    "nama_lengkap_sesuai_KTP": "Budi Santoso",
    "status_kerja": "TETAP",
    "updatedAt": "2026-09-29T10:30:00.000Z"
  },
  "message": "Data karyawan berhasil diperbarui.",
  "meta": {}
}
```

### 1.2 Respons Sukses Data Koleksi / Paginated List (Collection Response)
```json
{
  "success": true,
  "data": [
    {
      "id": "CLI-000001",
      "name": "PT Astra Tol Nusantara",
      "city": "Tangerang",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 18,
    "totalPages": 1
  }
}
```

### 1.3 Respons Kegagalan Validasi / Error (Error Envelope)
```json
{
  "success": false,
  "message": "Validasi data gagal.",
  "errors": {
    "NIK": ["NIK wajib terdiri dari tepat 16 digit angka."],
    "email": ["Format email tidak valid."]
  }
}
```

---

## 2. Header HTTP Standar (Standard HTTP Headers)

Setiap permintaan dari Frontend ke Backend menyertakan header:
- `Content-Type: application/json` (kecuali upload multipart form-data)
- `Accept: application/json`
- `Authorization: Bearer <JWT_ACCESS_TOKEN>` (pada seluruh rute privat terproteksi)

---

## 3. Spesifikasi Endpoint per Modul (Endpoint Specifications)

### 3.1 Autentikasi & Sesi Pengguna (`/auth`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `POST` | `/auth/login` | Otentikasi pengguna & terbitkan JWT | `{ username, password }` | Publik |
| `POST` | `/auth/refresh` | Perpanjang token akses via refresh token | `{ refreshToken }` | Publik |
| `GET` | `/auth/me` | Ambil profil pengguna login & daftar izin | - | Terautentikasi |
| `POST` | `/auth/logout` | Revokasi sesi & blacklist token | - | Terautentikasi |

### 3.2 Master Karyawan (`/employees`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/employees` | Daftar karyawan (filter & paginasi) | `?search=&status=&serviceType=&page=&limit=` | `employee.read` |
| `GET` | `/employees/:id` | Detail lengkap profil satu karyawan | - | `employee.read` |
| `POST` | `/employees` | Daftarkan personil baru | `{ nama_lengkap_sesuai_KTP, NIK, ... }` | `employee.create` |
| `PATCH` | `/employees/:id` | Perbarui informasi profil karyawan | `{ jabatan, alamat, telepon, ... }` | `employee.update` |
| `POST` | `/employees/:id/delete-request` | Ajukan permohonan nonaktif/hapus ke Direktur | `{ reason, requestedBy }` | `employee.delete.request` |
| `POST` | `/employees/:id/soft-delete` | Eksekusi penghapusan logis pasca-persetujuan | `{ deletedBy, reason }` | `employee.delete.approve` |

### 3.3 Penugasan & Rotasi Posko (`/placements`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/placements` | Daftar penugasan personil aktif/riwayat | `?employeeId=&clientId=&locationId=&status=&page=` | `placement.read` |
| `GET` | `/placements/:id` | Detail penugasan dan formasi posko | - | `placement.read` |
| `POST` | `/placements` | Plotting personil ke posko & jadwal | `{ employeeId, clientId, locationId, shiftId, role }` | `placement.create` |
| `PATCH` | `/placements/:id` | Penyesuaian data penugasan berjalan | `{ shiftId, role, notes }` | `placement.update` |
| `POST` | `/placements/:id/transfer` | Rotasi personil (tutup lama, buat baru) | `{ newClientId, newLocationId, newShiftId, notes }` | `placement.transfer` |
| `POST` | `/placements/:id/end` | Akhiri penugasan aktif (pelepasan pos) | `{ reason, endDate }` | `placement.end` |

### 3.4 Klien & Mitra Bisnis (`/clients`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/clients` | Daftar seluruh mitra klien aktif & prospek | `?search=&status=&city=&page=&limit=` | `client.read` |
| `GET` | `/clients/:id` | Detail profil klien, PIC, dan kontrak | - | `client.read` |
| `POST` | `/clients` | Daftarkan entitas klien korporat baru | `{ name, industry, city, contactPerson, email, phone }` | `client.create` |
| `PATCH` | `/clients/:id` | Perbarui data kontak atau terms klien | `{ contactPerson, phone, address, status }` | `client.update` |

### 3.5 Lokasi & Posko Pengamanan (`/sites`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/sites` | Daftar posko jaga/lokasi klien | `?clientId=&city=&search=&page=` | `location.read` |
| `GET` | `/sites/:id` | Detail spesifik pos jaga dan kuota jaga | - | `location.read` |
| `POST` | `/sites` | Tambah posko operasional baru pada klien | `{ name, address, clientId, type, quota }` | `location.create` |
| `PATCH` | `/sites/:id` | Perbarui data pos jaga | `{ name, address, quota, status }` | `location.update` |

### 3.6 Presensi & Roster Kerja (`/attendance` & `/shifts`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/shifts` | Master jadwal shift jaga posko | - | `shift.read` |
| `POST` | `/shifts` | Buat jadwal shift baru (Jam Masuk/Pulang)| `{ name, startTime, endTime, description }` | `shift.create` |
| `GET` | `/attendance` | Spreadsheet log presensi posko | `?date=&locationId=&clientId=&status=` | `attendance.read` |
| `POST` | `/attendance/check-in` | Rekam absensi (in/out/alpha/izin) | `{ employeeId, locationId, shiftId, status, time }` | `attendance.record` |
| `PATCH` | `/attendance/:id` | Koreksi jam masuk/keluar oleh HRD | `{ checkInTime, checkOutTime, notes }` | `attendance.edit` |
| `POST` | `/attendance/finalize` | Finalisasi & kunci lembar absensi bulanan | `{ month, year, finalizedBy }` | `attendance.finalize` |
| `POST` | `/attendance/reopen` | Buka kembali lembar terkunci (Direktur) | `{ periodId, reason, authorizedBy }` | `attendance.reopen` |

### 3.7 Keuangan, Faktur & Payroll (`/finance`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/finance/invoices` | Daftar faktur tagihan jasa outsourcing | `?search=&status=&clientId=&page=` | `invoice.read` |
| `GET` | `/finance/invoices/:id` | Rincian termin, PPN, dan histori setoran | - | `invoice.read` |
| `POST` | `/finance/invoices` | Terbitkan draf invoice baru ke klien | `{ invoiceNumber, clientId, period, amount, dueDate }` | `invoice.create` |
| `PATCH` | `/finance/invoices/:id/status` | Transisi status faktur | `{ status: "ISSUED"|"PARTIALLY_PAID"|"PAID"|"OVERDUE"|"VOID", reason }` | `invoice.update` |
| `POST` | `/finance/invoices/:id/payment` | Rekam setoran pembayaran invoice | `{ amount, paymentMethod, referenceNumber, date }` | `invoice.payment` |
| `GET` | `/finance/payroll` | Daftar periode penggajian karyawan | `?period=&status=&page=` | `payroll.read` |
| `POST` | `/finance/payroll` | Buat perhitungan draf payroll (Maker) | `{ periodMonth, year, notes }` | `payroll.create` |
| `POST` | `/finance/payroll/:id/approve` | Otorisasi eksekutif payroll (Checker) | `{ approvedBy, notes }` | `payroll.approve` |
| `GET` | `/finance/cash-flow` | Agregasi arus kas masuk dan operasional | `?month=&year=` | `finance.report` |
| `GET` | `/finance/cod` | Monitoring kas titipan kurir COD | `?status=&courierName=&page=` | `cod.read` |
| `POST` | `/finance/cod/:id/reconcile`| Rekonsiliasi setoran uang COD kurir | `{ amountCollected, depositSlipNumber }` | `cod.reconcile` |
| `POST` | `/finance/cod/:id/escalate` | Eskalasi selisih uang COD ke Legal | `{ amountDifference, notes }` | `cod.escalate` |

### 3.8 Legal, Kontrak PKS & Kepatuhan (`/legal`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/legal/contracts` | Daftar Perjanjian Kerja Sama (PKS) klien | `?search=&status=&clientId=&page=` | `contract.read` |
| `POST` | `/legal/contracts` | Registrasi draf kontrak PKS baru | `{ contractNumber, clientId, startDate, endDate, value }` | `contract.create` |
| `PATCH` | `/legal/contracts/:id/status` | Transisi status kontrak PKS | `{ status: "LEGAL_REVIEW"|"APPROVED"|"SIGNED"|"ACTIVE"|"EXPIRING"|"RENEWED"|"EXPIRED" }` | `contract.update` |
| `GET` | `/legal/cases` | Register sengketa perkara & perselisihan | `?status=&category=&page=` | `legal.case.read` |
| `POST` | `/legal/cases` | Buka berkas perkara hukum baru | `{ title, clientId, caseType, description, targetEntity }` | `legal.case.create` |
| `GET` | `/legal/compliance` | Monitoring lisensi & SIO Mabes Polri | - | `compliance.read` |

### 3.9 Marketing & Pipeline Penjualan (`/marketing`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/marketing/leads` | Prospek masuk dari web / B2B sales | `?status=&source=&page=` | `lead.read` |
| `POST` | `/marketing/leads` | Tambah prospek klien baru | `{ companyName, picName, phone, email, serviceInterest }` | `lead.create` |
| `GET` | `/marketing/opportunities` | Pipeline tender & negosiasi harga | `?stage=&salesOwner=&page=` | `opportunity.read` |
| `PATCH` | `/marketing/opportunities/:id/stage`| Pindah tahapan sales pipeline | `{ stage: "CONTACTED"|"QUALIFIED"|"SURVEY"|"QUOTED"|"NEGOTIATION" }` | `opportunity.update` |
| `POST` | `/marketing/opportunities/:id/win` | Menangkan tender & cascade lintas divisi | `{ dealValue, startDate, handoverNotes }` | `opportunity.win` |

### 3.10 Operasional Lapangan & Insiden (`/operations`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/operations/incidents` | Daftar insiden keamanan & posko | `?severity=&status=&locationId=&page=` | `incident.read` |
| `POST` | `/operations/incidents` | Buat laporan insiden baru | `{ title, locationId, clientId, severity, description }` | `incident.create` |
| `POST` | `/operations/incidents/:id/resolve` | Selesaikan penanganan insiden posko | `{ resolutionNotes, actorName }` | `incident.resolve` |
| `POST` | `/operations/incidents/:id/escalate`| Eskalasi insiden posko ke Manajemen/Legal | `{ targetDept, reason }` | `incident.escalate` |
| `GET` | `/operations/replacements`| Tiket pergantian personil mendesak | `?status=&page=` | `replacement.read` |
| `POST` | `/operations/replacements`| Ajukan personil cadangan pengganti | `{ currentEmployeeId, locationId, reason, priority }` | `replacement.create` |
| `GET` | `/operations/field-reports` | Jurnal laporan giat patroli harian | `?date=&locationId=&page=` | `patrol.read` |
| `POST` | `/operations/field-reports`| Unggah laporan patroli posko | `{ locationId, shiftId, activityType, summary }` | `patrol.create` |

### 3.11 Pusat Persetujuan Eksekutif (`/approvals`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/approvals` | Antrean permohonan persetujuan Direktur | `?status=PENDING&type=&department=&page=` | `approval.read` |
| `POST` | `/approvals/:id/approve` | Otorisasi & eksekusi mutasi model terkait | `{ notes, actorName }` | `approval.act` |
| `POST` | `/approvals/:id/reject` | Tolak permohonan dengan catatan alasan | `{ reason, actorName }` | `approval.act` |

### 3.12 Log Audit Persisten (`/audit-logs`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/audit-logs` | Rekam jejak seluruh mutasi penting | `?search=&module=&action=&dateFrom=&dateTo=&page=&limit=` | `audit.log.read` |

### 3.13 Penyimpanan Dokumen & Berkas (`/storage`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `POST` | `/storage/upload` | Unggah file via multipart form data | `FormData: { file, category, entityId, description }` | Terautentikasi |
| `POST` | `/storage/presigned-url` | Ambil URL presigned untuk direct upload S3 | `{ filename, mimeType, category }` | Terautentikasi |
| `DELETE` | `/storage/files/:id` | Hapus file dari penyimpanan | - | Terautentikasi |
