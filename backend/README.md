# SAMBUT Backend API (Laravel 12)

Backend RESTful API untuk sistem **Sambut GCP 2026** (Opening PPDB & SemiFinal Maheswara Maheswari 2027), dibangun menggunakan **Laravel 12** dan **Laravel Sanctum**.

---

## 🚀 Fitur Utama Backend

1. **Authentication (Laravel Sanctum)**:
   - Login admin dengan username atau email (`admin` / `admin@example.com`, password: `GenZ2026`).
   - Token-based API authentication via Bearer token.
2. **Manajemen Undangan (Invitations CRUD & Filter)**:
   - 4 Kategori: `SMP`, `Guru`, `VIP`, `Orang Tua/Wali`.
   - Pencarian cerdas (nama, kode, instansi, kepala sekolah, PIC, telepon, kursi, nama siswa).
   - Filter berdasarkan kategori, status RSVP, status kehadiran, dan status MOU.
   - Validasi khusus kategori SMP (kuota maksimal 10, kepala sekolah wajib).
   - Impor massal data undangan (bulk import).
3. **Check-In Scanner & Presensi Real-Time**:
   - Verifikasi barcode / QR code tiket (`/api/check-in/verify/{identifier}`).
   - Check-in presensi per anggota (SMP) atau akumulasi kuota (Guru, VIP, Orang Tua/Wali).
   - Validasi pembatalan dan pencegahan kehadiran melebihi kuota.
   - Otomatis mencatat riwayat aktivitas check-in.
4. **Portal Publik & Golden Ticket**:
   - Halaman tiket publik dan golden ticket berdasarkan kode unik (`GCP-SMP-XXXXX`).
   - Konfirmasi kehadiran (RSVP: Hadir, Tidak Hadir, Pending) oleh tamu.
   - Portal mandiri perwakilan SMP untuk mengisi dan mengubah anggota siswa & guru pendamping.
5. **Buku Tamu (Ucapan & Doa)**:
   - Pengiriman dan daftar ucapan doa dari siswa, guru/pendamping, dan tamu undangan.
6. **Statistik & Laporan (Rekap & Ekspor)**:
   - Perhitungan total undangan, sekolah, kuota, pendaftar, hadir, pending, tidak hadir.
   - Distribusi per kategori dan status MOU.
   - Ekspor data lengkap siap format CSV/Excel.
7. **Pengaturan Acara & Reset Simulasi**:
   - Pengaturan nama acara, sekolah penyelenggara, tanggal, lokasi, tagline, dan foto bersama.
   - Endpoint `/api/reset` untuk mereset data ke kondisi awal secara instan.

---

## 🛠️ Persyaratan Sistem

- **PHP**: `^8.2` (diuji pada PHP 8.5)
- **Composer**: `^2.x`
- **Database**: SQLite (default, zero configuration) atau MySQL / PostgreSQL

---

## 📦 Panduan Instalasi & Menjalankan

### 1. Masuk ke Folder Backend
```bash
cd backend
```

### 2. Konfigurasi Environment & Database
File `.env` telah terhubung ke database **MySQL**:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sambut_gcp
DB_USERNAME=root
DB_PASSWORD=
APP_URL=http://127.0.0.1:8000
```

### 3. Migrasi & Seeding
Database sudah siap pakai dalam kondisi bersih (tanpa data demo).
- Untuk reset atau migrasi ulang:
```bash
php artisan migrate:fresh --seed
```
- Jika ingin memasukkan data simulasi demo (opsional):
```bash
php artisan db:seed --class=DemoSeeder
```

### 4. Menjalankan Server Backend
```bash
php artisan serve --port=8000
```
Backend akan berjalan di: **`http://127.0.0.1:8000`**

---

## 🔑 Kredensial Default Admin

- **Username**: `admin`
- **Email**: `admin@example.com`
- **Password**: `GenZ2026`

---

## 🧪 Menjalankan Pengujian Otomatis (Tests)

Backend telah dilengkapi dengan pengujian fitur (Feature Tests) lengkap:
```bash
php artisan test
```
*Hasil: 11 tests, 46 assertions passed.*

---

## 📚 Daftar Endpoint API

Semua rute API diawali dengan `/api`.

### 1. Autentikasi
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `POST` | `/api/login` | Login admin (`username`, `password`) | Publik |
| `GET` | `/api/me` | Profil admin yang sedang login | Bearer Token |
| `POST` | `/api/logout` | Logout & cabut token | Bearer Token |

### 2. Undangan (Invitations)
| Method | Endpoint | Query / Body | Deskripsi |
|---|---|---|---|
| `GET` | `/api/invitations` | `?category=SMP&search=cibitung&rsvp=Hadir&attendance=partial` | Daftar semua undangan |
| `GET` | `/api/invitations/{id}` | - | Detail undangan berdasarkan ID atau Kode |
| `POST` | `/api/invitations` | JSON payload undangan | Tambah undangan baru |
| `PUT` | `/api/invitations/{id}` | JSON payload update | Perbarui data undangan & anggota |
| `DELETE`| `/api/invitations/{id}` | - | Hapus undangan & seluruh anggotanya |
| `POST` | `/api/invitations/import` | `{ "items": [...] }` | Impor massal data undangan |

### 3. Presensi & Scanner Check-In
| Method | Endpoint | Body | Deskripsi |
|---|---|---|---|
| `GET` | `/api/check-in/verify/{identifier}` | - | Verifikasi tiket / scan QR code |
| `POST` | `/api/check-in` | `{ "code": "GCP-SMP-A7K2X", "member_ids": ["s0-m0"], "count": 1 }` | Eksekusi check-in peserta |

### 4. Portal Publik & RSVP
| Method | Endpoint | Body | Deskripsi |
|---|---|---|---|
| `GET` | `/api/public/data` | - | Data publik (settings, pesan, aktivitas) |
| `GET` | `/api/public/invitations/{code}` | - | Detail undangan untuk Golden Ticket |
| `POST` | `/api/public/rsvp/{code}` | `{ "rsvp": "Hadir", "phone": "0812..." }` | Konfirmasi kehadiran tamu |
| `POST` | `/api/public/schools/{code}/members` | `{ "members": [...], "pic": "...", "phone": "..." }` | Input anggota mandiri sekolah SMP |

### 5. Ucapan, Doa & Aktivitas
| Method | Endpoint | Body | Deskripsi |
|---|---|---|---|
| `GET` | `/api/messages` | - | Ambil semua ucapan & doa |
| `POST` | `/api/messages` | `{ "name": "...", "text": "...", "category": "Siswa" }` | Kirim ucapan & doa |
| `GET` | `/api/activities` | - | Log aktivitas terbaru |

### 6. Statistik, Rekap & Pengaturan
| Method | Endpoint | Body | Deskripsi |
|---|---|---|---|
| `GET` | `/api/stats` | - | Ringkasan statistik dashboard & MOU |
| `GET` | `/api/reports/export` | - | Data rekap lengkap untuk ekspor CSV/Excel |
| `GET` | `/api/settings` | - | Ambil pengaturan acara |
| `PUT` | `/api/settings` | `{ "name": "...", "date": "...", "location": "..." }` | Perbarui pengaturan acara |
| `POST` | `/api/reset` | - | Reset simulasi ke data awal |

---

## 🔗 Hubungan dengan Frontend ReactJS

Frontend ReactJS di root direktori dapat terhubung ke backend ini melalui HTTP request (misalnya `fetch` atau `axios`) ke `http://127.0.0.1:8000/api`.
CORS telah dikonfigurasi pada `config/cors.php` untuk mengizinkan origin frontend lokal seperti `http://localhost:5173`, `http://localhost:3000`, dan `http://127.0.0.1:*`.
