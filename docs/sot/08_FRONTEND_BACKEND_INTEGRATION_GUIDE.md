# 08_FRONTEND_BACKEND_INTEGRATION_GUIDE.md — PT. BARAK IOMS
**Versi:** 2.1 (Step-by-Step Developer Integration Manual)  
**Tanggal:** 4 Oktober 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Ruang Lingkup:** Panduan Praktis Tim Backend Menghubungkan API ke Frontend

---

## 1. Pengaturan Lingkungan Integrasi Lokal (Local Environment Setup)

### 1.1 Konfigurasi File Lingkungan Frontend (`.env`)
Di direktori `frontend/`, salin `.env.example` menjadi `.env` dan aktifkan mode `rest`:

```env
# Aktifkan panggilan HTTP REST aktual (bukan mock lokal)
VITE_API_MODE=rest

# Arahkan ke endpoint server Express backend Anda
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Label lingkungan
VITE_APP_ENV=development
```

### 1.2 Menjalankan Server Pengembangan Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend akan berjalan secara default di `http://localhost:5173`.

---

## 2. Konfigurasi Wajib pada Server Backend (Express.js)

### 2.1 Konfigurasi CORS (Cross-Origin Resource Sharing)
Server backend Express **wajib** mengizinkan origin Vite frontend dan mendukung pengiriman header autentikasi:

```javascript
// Contoh implementasi di Express backend:
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bimasenaadhirajasaradika.vercel.app' // domain produksi
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Diblokir oleh kebijakan CORS PT. BARAK'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));
```

---

## 3. Alur Otentikasi & Penyimpanan Token (JWT Integration Flow)

1. **Login:** Ketika pengguna menekan tombol Masuk di `/ops/login`, frontend memanggil:
   ```http
   POST /api/v1/auth/login
   Content-Type: application/json

   {
     "username": "direktur@barak.co.id",
     "password": "Password123!"
   }
   ```
2. **Format Respon yang Diharapkan:**
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "refreshToken": "d8f9e0a1-...",
       "user": {
         "id": "usr-001",
         "username": "direktur",
         "name": "Juli Priyanto",
         "role": "DIREKTUR",
         "permissions": ["*"]
       }
     },
     "message": "Login berhasil"
   }
   ```
3. Frontend secara otomatis menyimpan token ke `localStorage.getItem('barak_auth_token')` dan menyematkannya pada setiap request berikutnya:
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1Ni...
   ```
4. **Penanganan Token Kedaluwarsa (401 Unauthorized):**
   Jika server merespons status HTTP `401`, klien frontend di `src/services/apiClient.js` secara otomatis memicu event `barak_unauthorized`, menghapus token kadaluarsa, dan mengarahkan pengguna kembali ke halaman `/ops/login`.
5. **Pembersihan Sesi Inputer Lapangan Saat Logout:**
   Saat pengguna dengan peran inputer (`user1`, `user2`) keluar (*logout*), frontend memicu pembersihan draf lembar presensi sementara (`DELETE /api/v1/attendance/sheets/drafts`) agar sesi berikutnya bersih dari riwayat draf terdahulu.

---

## 4. Format Respons Validasi Error

Jika input data tidak valid, backend harus mengembalikan kode HTTP `422 Unprocessable Entity` atau `400 Bad Request` dengan format:

```json
{
  "success": false,
  "message": "Data yang dikirimkan tidak valid.",
  "errors": {
    "NIK": ["NIK telah terdaftar pada sistem."],
    "nomor_telepon": ["Nomor telepon tidak boleh kosong."]
  }
}
```
Frontend akan otomatis membaca objek `errors` dan menampilkan garis merah serta pesan error di bawah field formulir terkait.

---

## 5. Strategi Pengujian Bertahap per Modul (Incremental Testing)

Backend developer dapat menguji integrasi modul per modul secara terisolasi tanpa harus menyelesaikan seluruh modul sekaligus.

Di setiap berkas adapter (`src/services/adapters/*.js`), terdapat pengecekan:
```javascript
const isMock = import.meta.env.VITE_API_MODE !== 'rest';
```
Untuk menguji modul Karyawan & Presensi:
1. Pastikan endpoint `/api/v1/employees` dan `/api/v1/employees/import` di Express telah aktif.
2. Buka halaman `/ops/master/employees` di browser. Lakukan pengujian Impor Excel Karyawan (`EmployeeImportModal.jsx`) dengan memilih Klien dan Lokasi Penempatan.
3. Buka halaman `/ops/hrd/attendance/spreadsheet` di browser. Pilih Klien dan Lokasi Penempatan yang sama, dan pastikan daftar karyawan yang diimpor otomatis muncul pada lembar kerja.
4. Buka tab **Network** di Developer Tools browser untuk memverifikasi payload HTTP dan response JSON.

---

## 6. Rekomendasi Deployment Produksi (Target Hosting)

- **Frontend:** **Vercel**
  - Menggunakan konfigurasi yang telah disediakan di [vercel.json](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/vercel.json) dengan rewrite SPA:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```
- **Backend API & Database:** **Railway**
  - Railway Node.js Service (Express.js)
  - Railway MySQL Service (Database berelasi dengan backup harian)
  - Variabel lingkungan Vercel diatur: `VITE_API_MODE=rest` dan `VITE_API_BASE_URL=https://api-barak.up.railway.app/api/v1`.

---

## 7. Catatan Integrasi Finansial & Faktur (Invoicing & Single BCA Channel)

1. **Pembuatan Faktur (`POST /api/v1/finance/invoices`):**
   - Backend wajib menerima dan menyimpan header faktur beserta snapshot profil klien (`clientName`, `clientContact`, `clientAddress`, `clientCity`, `clientProvince`) agar lembar cetak A4 tidak terpengaruh jika data master klien berubah di masa mendatang.
   - Child items `serviceItems` (rincian jasa) dan `adjustments` (penambah reward / pengurang potongan) disimpan ke tabel relasional terpisah (`invoice_service_items` dan `invoice_adjustments`).
   - Formula total tagihan bersih wajib divalidasi di backend:
     $$\text{Total} = (\text{Subtotal Jasa} + \text{Subtotal Reward} + \text{Manajemen Fee} + \text{PPN 11\%}) - \text{Subtotal Potongan} - \text{PPh 23}$$
2. **Pencatatan Pembayaran (`POST /api/v1/finance/invoices/:id/payment`):**
   - Kanal penerimaan dikunci tunggal ke **Rekening BCA `8833951911` a.n. BIMASENA ADHIRAJASA RADHIKA**.
   - Kolom `paymentMethod` selalu bernilai `"Bank Transfer (BCA)"`.
   - Backend wajib memvalidasi `referenceNumber` (nomor bukti transfer) dan memutakhirkan `amountPaid`, `remainingAmount`, serta transisi status faktur (`PAID` jika sisa tagihan $\le 0$).

