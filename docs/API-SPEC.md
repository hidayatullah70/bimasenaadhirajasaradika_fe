# API-SPEC — PT. BARAK IOMS
**Versi:** 2.0 (Authoritative Consolidated REST Specification)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE, AUDITED, & BACKEND-READY  
**Sinkronisasi:** Mengintegrasikan `02_API_CONTRACT.md`, `05_WORKFLOW_CONTRACT.md`, dan seluruh 24 Service Adapter frontend.

---

## 1. Arsitektur Komunikasi & Kontrak Dasar

- **Base URL:** `/api/v1` (contoh lokal: `http://localhost:3001/api/v1`)
- **Protokol:** HTTP/1.1 atau HTTP/2 via REST semantik
- **Enkoding:** JSON UTF-8
- **Autentikasi:** Bearer Token JWT via header `Authorization: Bearer <TOKEN>`
- **Prinsip:** Stateless session, validasi schema server-side, audit log untuk seluruh mutasi kritis, soft-delete untuk rekaman operasional.

---

## 2. Format Amplop Respons Standar (Standard Response Envelopes)

Semua endpoint API backend **wajib** mengembalikan respons JSON dalam struktur amplop (*envelope*) standar berikut. Frontend telah dikonfigurasikan untuk mengonsumsi format ini secara konsisten melalui `src/services/apiClient.js`.

### 2.1 Respons Sukses Rekaman Tunggal / Mutasi (Single Entity Response)
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

### 2.2 Respons Sukses Data Koleksi / Paginated List (Collection Response)
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

### 2.3 Respons Kegagalan Validasi / Error (Error Envelope)
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

## 3. Header HTTP Standar (Standard HTTP Headers)

Setiap permintaan dari Frontend ke Backend menyertakan header:
- `Content-Type: application/json` (kecuali upload multipart form-data)
- `Accept: application/json`
- `Authorization: Bearer <JWT_ACCESS_TOKEN>` (pada seluruh rute privat terproteksi)

---

## 4. Konvensi Query Parameter (Pagination & Filters)

Frontend mengirimkan filter dan paginasi melalui query string URL terserialisasi:
- `page`: Nomor halaman (1-indexed, default `1`)
- `limit` / `pageSize`: Jumlah baris per halaman (default `10` atau `20`, max `100`)
- `search`: Kata kunci pencarian global/multi-kolom
- `status`: Filter berdasarkan nilai enum status uppercase (contoh: `ACTIVE`, `PENDING`)
- `sortBy`: Nama kolom acuan pengurutan (contoh: `createdAt`, `tanggal_masuk`)
- `sortOrder`: Arah pengurutan (`asc` atau `desc`, default `desc`)
- `dateFrom` & `dateTo`: Filter rentang waktu format ISO (`YYYY-MM-DD`)

---

## 5. Spesifikasi Lengkap Endpoint per Modul Operasional

### 5.1 Autentikasi & Profil Pengguna (`/auth`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `POST` | `/auth/login` | Otentikasi username & password, terbitkan token JWT | `{ username, password }` | Publik |
| `POST` | `/auth/refresh` | Perpanjang akses token kedaluwarsa | `{ refreshToken }` | Publik |
| `GET` | `/auth/me` | Ambil identitas pengguna login & daftar izin | - | Terautentikasi |
| `POST` | `/auth/logout` | Revokasi sesi & blacklist token di server | - | Terautentikasi |

### 5.2 Master Karyawan (`/employees`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/employees` | Ambil koleksi karyawan (filter & paginasi) | `?search=&status=&serviceType=&page=&limit=` | `employee.read` |
| `GET` | `/employees/:id` | Detail lengkap profil personil | - | `employee.read` |
| `POST` | `/employees` | Registrasi karyawan baru | `{ nama_lengkap_sesuai_KTP, NIK, jenis_kelamin, ... }` | `employee.create` |
| `PATCH` | `/employees/:id` | Perbarui data profil karyawan | `{ jabatan, alamat, telepon, status_pajak, ... }` | `employee.update` |
| `POST` | `/employees/:id/delete-request` | Ajukan permohonan nonaktif/hapus ke Direktur | `{ reason, requestedBy }` | `employee.delete.request` |
| `POST` | `/employees/:id/soft-delete` | Eksekusi penghapusan logis pasca-persetujuan | `{ deletedBy, reason }` | `employee.delete.approve` |

### 5.3 Penugasan & Rotasi Posko (`/placements`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/placements` | Daftar penugasan personil aktif & histori | `?employeeId=&clientId=&locationId=&status=&page=` | `placement.read` |
| `GET` | `/placements/:id` | Detail formasi penugasan | - | `placement.read` |
| `POST` | `/placements` | Plotting personil ke posko, klien, dan shift | `{ employeeId, clientId, locationId, shiftId, role }` | `placement.create` |
| `PATCH` | `/placements/:id` | Penyesuaian data penugasan berjalan | `{ shiftId, role, notes }` | `placement.update` |
| `POST` | `/placements/:id/transfer` | Rotasi personil (tutup lama, buat baru) | `{ newClientId, newLocationId, newShiftId, notes }` | `placement.transfer` |
| `POST` | `/placements/:id/end` | Akhiri penugasan aktif | `{ reason, endDate }` | `placement.end` |

### 5.4 Klien & Mitra Bisnis (`/clients`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/clients` | Daftar mitra klien korporat (18 klien resmi) | `?search=&status=&city=&page=&limit=` | `client.read` |
| `GET` | `/clients/:id` | Detail profil klien, PIC, dan histori | - | `client.read` |
| `POST` | `/clients` | Registrasi entitas klien baru | `{ name, industry, city, contactPerson, email, phone }` | `client.create` |
| `PATCH` | `/clients/:id` | Perbarui kontak atau ketentuan komersial | `{ contactPerson, phone, address, status }` | `client.update` |

### 5.5 Lokasi & Posko Pengamanan (`/sites`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/sites` | Daftar lokasi posko jaga klien | `?clientId=&city=&search=&page=` | `location.read` |
| `GET` | `/sites/:id` | Detail pos jaga, koordinat peta & kuota personil | - | `location.read` |
| `POST` | `/sites` | Tambah posko operasional baru pada klien | `{ name, address, clientId, type, quota, lat, lng }` | `location.create` |
| `PATCH` | `/sites/:id` | Perbarui informasi posko | `{ name, address, quota, status }` | `location.update` |

### 5.6 Presensi & Roster Shift (`/attendance` & `/shifts`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/shifts` | Master jadwal shift jaga | - | `shift.read` |
| `POST` | `/shifts` | Daftarkan master shift baru | `{ name, startTime, endTime, description }` | `shift.create` |
| `GET` | `/attendance` | Spreadsheet log presensi posko | `?date=&locationId=&clientId=&status=` | `attendance.read` |
| `POST` | `/attendance/check-in` | Rekam jam absensi (masuk/pulang/izin) | `{ employeeId, locationId, shiftId, status, time }` | `attendance.record` |
| `PATCH` | `/attendance/:id` | Koreksi jam masuk/keluar oleh HRD | `{ checkInTime, checkOutTime, notes }` | `attendance.edit` |
| `POST` | `/attendance/finalize` | Finalisasi & kunci lembar absensi bulanan | `{ month, year, finalizedBy }` | `attendance.finalize` |
| `POST` | `/attendance/reopen` | Buka kembali lembar terkunci (Direktur) | `{ periodId, reason, authorizedBy }` | `attendance.reopen` |

### 5.7 Keuangan, Faktur, COD & Payroll (`/finance`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/finance/invoices` | Daftar faktur tagihan jasa outsourcing | `?search=&status=&clientId=&page=` | `invoice.read` |
| `GET` | `/finance/invoices/:id` | Detail termin, rincian biaya, histori bayar | - | `invoice.read` |
| `POST` | `/finance/invoices` | Terbitkan faktur invoice baru ke klien | `{ invoiceNumber, clientId, clientName, clientContact, clientAddress, clientCity, clientProvince, billingPeriod, issueDate, dueDate, serviceItems: [{ description, amount }], adjustments: [{ type: 'REWARD'\|'POTONGAN', description, amount }], subtotalServices, subtotalReward, subtotalPotongan, managementFeeRate, managementFeeAmount, includePpn, ppnRate, ppnAmount, pph23Rate, pph23Amount, totalAmount, notes }` | `invoice.create` |
| `PATCH` | `/finance/invoices/:id/status` | Transisi status faktur | `{ status: "ISSUED"\|"PARTIALLY_PAID"\|"PAID"\|"OVERDUE"\|"VOID", reason }` | `invoice.update` |
| `POST` | `/finance/invoices/:id/payment` | Rekam pembayaran invoice via Rekening BCA | `{ amount, paymentMethod: "Bank Transfer (BCA)", referenceNumber, notes, date }` | `invoice.payment` |
| `GET` | `/finance/payroll` | Daftar periode penggajian karyawan | `?period=&status=&page=` | `payroll.read` |
| `POST` | `/finance/payroll` | Buat kalkulasi draf payroll (Maker) | `{ periodMonth, year, notes }` | `payroll.create` |
| `POST` | `/finance/payroll/:id/approve` | Otorisasi eksekutif payroll (Checker) | `{ approvedBy, notes }` | `payroll.approve` |
| `GET` | `/finance/cash-flow` | Ringkasan arus kas masuk & pengeluaran | `?month=&year=` | `finance.report` |
| `GET` | `/finance/cod` | Monitoring kas titipan kurir COD | `?status=&courierName=&page=` | `cod.read` |
| `POST` | `/finance/cod/:id/reconcile`| Rekonsiliasi setoran uang COD kurir | `{ amountCollected, depositSlipNumber }` | `cod.reconcile` |
| `POST` | `/finance/cod/:id/escalate` | Eskalasi selisih uang COD ke Legal | `{ amountDifference, notes }` | `cod.escalate` |

### 5.8 Legal, Kontrak PKS & Kepatuhan (`/legal`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/legal/contracts` | Daftar Perjanjian Kerja Sama (PKS) klien | `?search=&status=&clientId=&page=` | `contract.read` |
| `POST` | `/legal/contracts` | Buat draf kontrak PKS baru | `{ contractNumber, clientId, startDate, endDate, value }` | `contract.create` |
| `PATCH` | `/legal/contracts/:id/status` | Transisi status kontrak | `{ status: "LEGAL_REVIEW"|"APPROVED"|"SIGNED"|"ACTIVE"|"EXPIRING"|"RENEWED"|"EXPIRED" }` | `contract.update` |
| `GET` | `/legal/cases` | Register sengketa perkara & perselisihan | `?status=&category=&page=` | `legal.case.read` |
| `POST` | `/legal/cases` | Buka berkas perkara hukum baru | `{ title, clientId, caseType, description, targetEntity }` | `legal.case.create` |
| `GET` | `/legal/compliance` | Monitoring lisensi & SIO Mabes Polri | - | `compliance.read` |

### 5.9 Marketing & Pipeline Penjualan (`/marketing`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/marketing/leads` | Prospek masuk dari web / B2B sales | `?status=&source=&page=` | `lead.read` |
| `POST` | `/marketing/leads` | Tambah prospek klien baru | `{ companyName, picName, phone, email, serviceInterest }` | `lead.create` |
| `GET` | `/marketing/opportunities` | Pipeline tender & negosiasi harga | `?stage=&salesOwner=&page=` | `opportunity.read` |
| `PATCH` | `/marketing/opportunities/:id/stage`| Pindah tahapan sales pipeline | `{ stage: "CONTACTED"|"QUALIFIED"|"SURVEY"|"QUOTED"|"NEGOTIATION" }` | `opportunity.update` |
| `POST` | `/marketing/opportunities/:id/win` | Menangkan tender & cascade lintas divisi | `{ dealValue, startDate, handoverNotes }` | `opportunity.win` |

### 5.10 Operasional Lapangan & Insiden (`/operations`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/operations/incidents` | Daftar insiden keamanan posko | `?severity=&status=&locationId=&page=` | `incident.read` |
| `POST` | `/operations/incidents` | Buat laporan insiden baru | `{ title, locationId, clientId, severity, description }` | `incident.create` |
| `POST` | `/operations/incidents/:id/resolve` | Selesaikan penanganan insiden | `{ resolutionNotes, actorName }` | `incident.resolve` |
| `POST` | `/operations/incidents/:id/escalate`| Eskalasi insiden posko ke Legal/Direksi | `{ targetDept, reason }` | `incident.escalate` |
| `GET` | `/operations/replacements`| Tiket pergantian personil mendesak | `?status=&page=` | `replacement.read` |
| `POST` | `/operations/replacements`| Ajukan personil cadangan | `{ currentEmployeeId, locationId, reason, priority }` | `replacement.create` |
| `GET` | `/operations/field-reports` | Jurnal laporan patroli harian posko | `?date=&locationId=&page=` | `patrol.read` |
| `POST` | `/operations/field-reports`| Unggah laporan patroli posko | `{ locationId, shiftId, activityType, summary }` | `patrol.create` |

### 5.11 IT Support & Manajemen Aset Posko (`/it`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/it/tickets` | Daftar tiket gangguan IT & helpdesk | `?status=&priority=&category=&page=` | `ticket.read` |
| `POST` | `/it/tickets` | Buka tiket gangguan baru | `{ title, category, priority, description, locationId }` | `ticket.create` |
| `PATCH` | `/it/tickets/:id` | Perbarui status pengerjaan tiket | `{ status, assignedTo, resolutionNotes }` | `ticket.update` |
| `POST` | `/it/tickets/:id/resolve` | Selesaikan tiket & rekam waktu penyelesaian | `{ resolutionNotes }` | `ticket.resolve` |
| `GET` | `/it/assets` | Inventaris aset IT posko (HT, CCTV, Tablet) | `?locationId=&status=&category=&page=` | `asset.read` |
| `POST` | `/it/assets` | Registrasi perangkat IT baru | `{ assetCode, name, category, serialNumber, locationId }` | `asset.create` |
| `GET` | `/it/maintenance` | Jadwal pemeliharaan perangkat | `?status=&date=&page=` | `maintenance.read` |

### 5.12 Website CMS & Publikasi Konten (`/cms`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/cms/news` | Daftar berita publikasi resmi | `?status=&page=` | Publik / CMS |
| `POST` | `/cms/news` | Buat artikel berita baru | `{ title, slug, content, thumbnail, status }` | `cms.publish` |
| `GET` | `/cms/careers` | Daftar lowongan pekerjaan aktif | `?department=&status=&page=` | Publik / CMS |
| `POST` | `/cms/careers` | Terbitkan lowongan karir baru | `{ title, department, location, requirements, quota }` | `cms.career` |
| `GET` | `/cms/faq` | Daftar tanya jawab resmi | - | Publik / CMS |
| `POST` | `/cms/inquiries` | Form konsultasi publik web (otomatis masuk ke Lead) | `{ name, company, email, phone, service, message }` | Publik |

### 5.13 Pusat Persetujuan Eksekutif (`/approvals`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/approvals` | Antrean permohonan persetujuan Direktur | `?status=PENDING&type=&department=&page=` | `approval.read` |
| `POST` | `/approvals/:id/approve` | Otorisasi & eksekusi mutasi model terkait | `{ notes, actorName }` | `approval.act` |
| `POST` | `/approvals/:id/reject` | Tolak permohonan dengan catatan alasan | `{ reason, actorName }` | `approval.act` |

### 5.14 Log Audit Persisten (`/audit-logs`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `GET` | `/audit-logs` | Rekam jejak seluruh mutasi penting | `?search=&module=&action=&dateFrom=&dateTo=&page=&limit=` | `audit.log.read` |

### 5.15 Penyimpanan Dokumen & Berkas (`/storage`)
| Metode | Endpoint | Deskripsi | Query / Body Payload | Izin Diperlukan |
|---|---|---|---|---|
| `POST` | `/storage/upload` | Unggah file via multipart form data | `FormData: { file, category, entityId, description }` | Terautentikasi |
| `POST` | `/storage/presigned-url` | Ambil URL presigned untuk upload langsung ke S3 | `{ filename, mimeType, category }` | Terautentikasi |
| `DELETE` | `/storage/files/:id` | Hapus file dari penyimpanan | - | Terautentikasi |

---

## 6. Jaminan Transaksi Atomik (Transaction Boundaries)

Operasi berikut **wajib dieksekusi dalam database transaction (ACID)** di level backend:
1. **Persetujuan Hapus Karyawan:** Update `approval_requests` $\rightarrow$ Soft-delete `employees` (`isDeleted: 1, status: 'NON_AKTIF'`) $\rightarrow$ Tutup `placements` aktif $\rightarrow$ Catat `audit_logs`.
2. **Rotasi Penugasan:** Update `placements` lama (`status: 'ROTATED', endDate: now()`) $\rightarrow$ Insert `placements` baru (`status: 'ACTIVE'`) $\rightarrow$ Catat `audit_logs`.
3. **Persetujuan Payroll:** Update `payroll_periods` (`status: 'APPROVED'`) $\rightarrow$ Buat transaksi pengeluaran `expenses` $\rightarrow$ Catat `audit_logs`.
4. **Marketing WON Cascade:** Update `opportunities` (`stage: 'WON'`) $\rightarrow$ Generate draf `contracts` $\rightarrow$ Generate profil klien `clients` $\rightarrow$ Catat `audit_logs`.
5. **Finalisasi / Pembukaan Presensi:** Update status lembar `attendance` $\rightarrow$ Kunci/Buka baris presensi $\rightarrow$ Catat `audit_logs`.

---

## 7. Pengujian API (API Testing via Hoppscotch / Postman)

Backend developer disarankan membuat koleksi Hoppscotch/Postman dengan struktur folder:
1. `01-Auth`: Login, Refresh, Me, Logout
2. `02-Master-Employees`: CRUD, Delete Request, Soft Delete
3. `03-Master-Clients-Sites`: CRUD Klien, Posko Jaga
4. `04-Operations-Placements`: Plotting, Rotasi Posko
5. `05-Attendance-Shifts`: Presensi, Finalisasi, Reopen
6. `06-Finance-Invoices-Payroll`: Faktur, Pembayaran, Penggajian
7. `07-Legal-Contracts-Cases`: PKS, Sengketa COD
8. `08-Marketing-Leads`: CRM, Tender WON Handover
9. `09-IT-Tickets-Assets`: Helpdesk, Inventarisasi
10. `10-Approvals-Audit`: Antrean Direktur, Log Aktivitas
