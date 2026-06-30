# Aloca.id — Backend API

REST API untuk aplikasi manajemen keuangan **Aloca.id**, dibangun dengan **Node.js + Express** dan **MySQL**.

---

## Daftar Isi

- [Deskripsi](#deskripsi)
- [Prerequisites](#prerequisites)
- [Instalasi (Tanpa Docker)](#instalasi-tanpa-docker)
- [Instalasi (Dengan Docker)](#instalasi-dengan-docker)
- [Konfigurasi .env](#konfigurasi-env)
- [Migrasi Database](#migrasi-database)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [API Endpoints](#api-endpoints)
- [Struktur Folder](#struktur-folder)

---

## Deskripsi

Aloca.id Backend menyediakan REST API untuk:

- **Autentikasi** — register, login dengan JWT
- **Manajemen Kantong** — buat, edit, hapus kantong keuangan per user
- **Transaksi** — catat pemasukan, pengeluaran, dan pindah saldo antar kantong
- **Kategori** — admin bisa membuat kategori pemasukan & pengeluaran beserta upload icon
- **Dashboard Admin** — statistik total user, transaksi, dan nominal

---

## Prerequisites

Pastikan sudah terinstall di komputer kamu:

| Tools | Versi Minimum | Keterangan |
|-------|--------------|------------|
| [Node.js](https://nodejs.org) | v18+ | Runtime JavaScript |
| [npm](https://www.npmjs.com) | v9+ | Package manager (ikut dengan Node.js) |
| [MySQL](https://www.mysql.com) | v8.0 | Database (atau via Docker) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | Latest | Opsional, untuk setup cepat |
| [Git](https://git-scm.com) | Latest | Version control |

---

## Instalasi (Tanpa Docker)

### 1. Clone Repository

```bash
git clone <url-repository-backend>
cd Aloca-Backend
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Setup Database MySQL

Buat database dan user di MySQL kamu:

```sql
CREATE DATABASE aloca_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aloca_user'@'localhost' IDENTIFIED BY 'aloca_password_123';
GRANT ALL PRIVILEGES ON aloca_management_db.* TO 'aloca_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Konfigurasi .env

Salin file contoh dan sesuaikan nilainya:

```bash
cp .env.example .env
```

Buka file `.env` lalu isi sesuai konfigurasi lokal kamu:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=aloca_user
DB_PASSWORD=aloca_password_123
DB_NAME=aloca_management_db

# WAJIB diganti — gunakan string acak yang panjang
JWT_SECRET=isi_dengan_string_rahasia_yang_sangat_panjang_dan_acak
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

> ⚠️ **Penting:** Jangan pernah commit file `.env` ke repository. File ini sudah ada di `.gitignore`.

### 5. Migrasi Database

Jalankan file SQL di folder `migrate/` secara berurutan:

```bash
# Menggunakan MySQL CLI
mysql -u aloca_user -p aloca_management_db < migrate/001_create_users_table.sql
mysql -u aloca_user -p aloca_management_db < migrate/002_create_kategori_tables.sql
mysql -u aloca_user -p aloca_management_db < migrate/003_create_kantong_table.sql
mysql -u aloca_user -p aloca_management_db < migrate/004_create_saldo_table.sql
mysql -u aloca_user -p aloca_management_db < migrate/005_create_log_transaksi_table.sql

# Seed data demo (opsional, tapi disarankan)
mysql -u aloca_user -p aloca_management_db < migrate/006_seed_users.sql
mysql -u aloca_user -p aloca_management_db < migrate/007_seed_kategori.sql
```

| File | Tipe | Isi |
|------|------|-----|
| `001` | Migration | Tabel `users` |
| `002` | Migration | Tabel `kategori_pemasukan` & `kategori_pengeluaran` |
| `003` | Migration | Tabel `kantong` |
| `004` | Migration | Tabel `saldo` |
| `005` | Migration | Tabel `log_transaksi` |
| `006` | **Seed** | 3 akun demo (admin, user1, user2) |
| `007` | **Seed** | 7 kategori transaksi default |

> File seed menggunakan `INSERT IGNORE` — aman dijalankan berulang kali tanpa duplikasi data.

---

## Instalasi (Dengan Docker) — Cara Termudah

Cara ini akan menjalankan **MySQL + Backend + phpMyAdmin** sekaligus tanpa setup manual.

### 1. Clone Repository

```bash
git clone <url-repository-backend>
cd Aloca-Backend
```

### 2. Jalankan Docker Compose

```bash
docker compose up -d --build
```

Docker akan otomatis:
- Menjalankan MySQL 8.0 di port **3306**
- Menjalankan backend Express di port **3000**
- Menjalankan phpMyAdmin di port **8080**
- Menjalankan semua file migrasi SQL secara otomatis

### 3. Verifikasi

```bash
# Cek container berjalan
docker compose ps

# Cek log backend
docker compose logs aloca-backend --tail=20
```

Akses phpMyAdmin di `http://localhost:8080` dengan:
- **Username:** `root`
- **Password:** `root_password_123`

> **Catatan Docker:** Jika kamu mengubah kode backend setelah container berjalan, rebuild dengan:
> ```bash
> docker compose build --no-cache aloca-backend
> docker compose up -d --force-recreate aloca-backend
> ```

---

## Menjalankan Aplikasi

### Development (hot-reload)

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000` dengan nodemon (auto-restart saat file berubah).

### Production

```bash
npm start
```

### Verifikasi Server Berjalan

```bash
curl http://localhost:3000/api/health
```

Response yang diharapkan:
```json
{
  "status": "success",
  "message": "Backend aloca.id berbasis Express siap digunakan!"
}
```

---

## API Endpoints

### Autentikasi (Publik)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Daftar akun baru |
| `POST` | `/api/auth/login` | Login, mendapat JWT token |

**Contoh body register:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "minimal6karakter"
}
```

**Contoh body login:**
```json
{
  "email": "john@example.com",
  "password": "minimal6karakter"
}
```

**Response login:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "username": "johndoe", "email": "john@example.com", "role": "user" }
  }
}
```

### Endpoint Terproteksi (butuh header `Authorization: Bearer <token>`)

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/kantong` | User | Ambil semua kantong + saldo |
| `POST` | `/api/kantong` | User | Buat kantong baru |
| `PUT` | `/api/kantong/:id` | User | Edit kantong |
| `DELETE` | `/api/kantong/:id` | User | Hapus kantong |
| `GET` | `/api/transaksi` | User | Riwayat transaksi |
| `POST` | `/api/transaksi/pemasukan` | User | Catat pemasukan |
| `POST` | `/api/transaksi/pengeluaran` | User | Catat pengeluaran |
| `POST` | `/api/transaksi/pindah-saldo` | User | Transfer antar kantong |
| `GET` | `/api/kategori/pemasukan` | User | Lihat kategori pemasukan |
| `GET` | `/api/kategori/pengeluaran` | User | Lihat kategori pengeluaran |
| `POST` | `/api/kategori/pemasukan` | **Admin** | Tambah kategori + upload icon |
| `DELETE` | `/api/kategori/pemasukan/:id` | **Admin** | Hapus kategori |
| `POST` | `/api/kategori/pengeluaran` | **Admin** | Tambah kategori + upload icon |
| `DELETE` | `/api/kategori/pengeluaran/:id` | **Admin** | Hapus kategori |
| `GET` | `/api/admin/stats` | **Admin** | Statistik dashboard admin |

### Membuat Akun Admin

Setelah register normal, update role melalui MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'email_admin@example.com';
```

Kemudian **logout dan login ulang** agar JWT token baru menyertakan role `admin`.

### Akun Demo (dari Seed)

Jika sudah menjalankan `006_seed_users.sql`, akun berikut siap dipakai:

| Email | Password | Role |
|-------|----------|------|
| `admin@aloca.id` | `password123` | `admin` |
| `user1@aloca.id` | `password123` | `user` |
| `user2@aloca.id` | `password123` | `user` |

---

## Struktur Folder

```
Aloca-Backend/
├── migrate/                    # File SQL migrasi database (jalankan berurutan)
│   ├── 001_create_users_table.sql
│   ├── 002_create_kategori_tables.sql
│   ├── 003_create_kantong_table.sql
│   ├── 004_create_saldo_table.sql
│   └── 005_create_log_transaksi_table.sql
│
├── src/
│   ├── app.js                  # Entry point — inisialisasi Express & server
│   │
│   ├── config/
│   │   ├── database.js         # Konfigurasi connection pool MySQL2
│   │   └── multer.js           # Konfigurasi upload file (icon kategori)
│   │
│   ├── controllers/            # Logic bisnis per fitur
│   │   ├── authController.js
│   │   ├── kantongController.js
│   │   ├── transaksiController.js
│   │   ├── kategoriController.js
│   │   ├── adminController.js
│   │   └── healthController.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js   # verifyToken & verifyAdmin
│   │   └── errorHandler.js     # Global error handler
│   │
│   ├── routes/                 # Definisi endpoint per fitur
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── kantong.routes.js
│   │   ├── transaksi.routes.js
│   │   ├── kategori.routes.js
│   │   └── admin.routes.js
│   │
│   └── utils/
│       └── responseHelper.js   # Helper format response JSON standar
│
├── uploads/                    # File icon yang diupload (auto-generated)
│   └── icons/
│
├── .env                        # Konfigurasi lokal (jangan di-commit!)
├── .env.example                # Template konfigurasi
├── docker-compose.yml          # Setup Docker lengkap
├── Dockerfile                  # Image Docker untuk backend
└── package.json
```

---

## Tips Tambahan

### Format Response API

Semua response mengikuti format standar:

```json
{
  "status": "success",
  "message": "Pesan deskriptif",
  "data": { ... }
}
```

Error response:

```json
{
  "status": "error",
  "message": "Pesan error",
  "statusCode": 400
}
```

### Troubleshooting Umum

**`Error: ER_ACCESS_DENIED_ERROR`**
→ Periksa `DB_USER` dan `DB_PASSWORD` di `.env`. Pastikan user MySQL sudah diberi akses ke database.

**`Error: connect ECONNREFUSED 127.0.0.1:3306`**
→ MySQL belum berjalan. Jalankan MySQL service atau `docker compose up -d aloca-db`.

**Endpoint mengembalikan 403 Forbidden**
→ Token JWT tidak memiliki role yang tepat. Pastikan sudah logout dan login ulang setelah mengubah role di database.

**Upload icon gagal**
→ Pastikan folder `uploads/icons/` bisa ditulis. Di Docker, ini sudah otomatis ditangani.

### Variabel Environment Penting

| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `DB_HOST` | ✅ | Host database (`localhost` atau nama service Docker) |
| `DB_USER` | ✅ | Username MySQL |
| `DB_PASSWORD` | ✅ | Password MySQL |
| `DB_NAME` | ✅ | Nama database |
| `JWT_SECRET` | ✅ | **Harus diganti** dengan string panjang dan acak di production |
| `PORT` | ❌ | Default `3000` |
| `CORS_ORIGIN` | ❌ | Default `*`, ganti ke URL frontend di production |
