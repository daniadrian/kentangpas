# API Kalkulator Bibitku

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791.svg)](https://www.postgresql.org/)

> **API Backend untuk Aplikasi Kalkulator Bibitku**
> Dikembangkan oleh Laboratorium Sistem Informasi - Universitas Brawijaya

---

## 📋 Deskripsi Project

**API Kalkulator Bibitku** adalah sistem backend berbasis RESTful API yang dirancang untuk mendukung aplikasi kalkulator pertanian kentang. API ini menyediakan perhitungan kebutuhan bibit kentang berdasarkan parameter lahan pertanian, mendukung berbagai generasi bibit (G0, G2, G3), serta menyediakan fitur perhitungan maju (forward) dan terbalik (reverse) untuk membantu petani dalam perencanaan budidaya kentang.

Project ini merupakan bagian dari penelitian dan pengembangan sistem informasi pertanian yang dikembangkan oleh **Laboratorium Sistem Informasi, Fakultas Ilmu Komputer, Universitas Brawijaya**.

### 🎯 Tujuan Project

1. **Akademis**: Menyediakan platform untuk penelitian dan pengembangan sistem informasi pertanian
2. **Praktis**: Membantu petani dalam menghitung kebutuhan bibit kentang secara akurat
3. **Edukasi**: Memberikan pembelajaran tentang teknologi web API dalam konteks pertanian
4. **Keberlanjutan**: Membangun sistem yang dapat dikembangkan dan dipelihara oleh generasi berikutnya

---

## ✨ Fitur Utama

### 1. Perhitungan Kebutuhan Bibit (Forward Calculation)

Menghitung kebutuhan bibit berdasarkan dimensi lahan:

- Input: Panjang lahan, lebar lahan, lebar guludan, lebar parit, jarak tanam
- Output: Jumlah guludan, total populasi tanaman, estimasi kebutuhan bibit (kg/kuintal)
- Mendukung 3 generasi bibit: **G0** (biji), **G2**, dan **G3** (kg)

### 2. Perhitungan Estimasi Luas Lahan (Reverse Calculation)

Menghitung luas lahan yang dibutuhkan berdasarkan jumlah bibit yang tersedia:

- Input: Jumlah bibit, jarak tanam, lebar guludan, lebar parit
- Output: Estimasi luas lahan (m²), jumlah guludan, panjang per guludan

### 3. Estimasi Biaya

Menghitung estimasi biaya bibit berdasarkan:

- Harga per kg atau kuintal (dari database atau input user)
- Range harga (minimum-maximum) untuk berbagai skenario

### 4. Manajemen Parameter Bibit

- Database parameter untuk setiap generasi bibit
- Informasi jumlah bibit per kg dan harga satuan
- Update parameter melalui database seeding

### 5. Security & Performance

- **CORS**: Whitelist domain tertentu
- **Rate Limiting**: Maksimal 100 request per 15 menit
- **Helmet**: HTTP security headers
- **Input Validation**: express-validator untuk semua endpoint

---

## 🛠️ Teknologi yang Digunakan

### Backend Framework & Runtime

- **Node.js** (v18+): JavaScript runtime environment
- **Express.js** (v5.1.0): Web application framework
- **Prisma ORM** (v6.13.0): Database toolkit dan ORM

### Database

- **PostgreSQL**: Relational database management system

### Security & Middleware

- **Helmet**: Security headers untuk Express
- **CORS**: Cross-Origin Resource Sharing
- **Express Rate Limit**: API rate limiting
- **Express Validator**: Request validation dan sanitization

### Development Tools

- **Nodemon**: Auto-restart server saat development
- **dotenv**: Environment variable management

### Package Manager

- **npm**: Node Package Manager

---

## 🏗️ Arsitektur Sistem

### Struktur MVC (Model-View-Controller)

```
kentangpas/
├── controllers/          # Business logic & request handling
│   └── calculator.controller.js
├── services/            # Core calculation & business logic
│   └── calculator.service.js
├── models/              # Database interaction layer
│   └── calculator.model.js
├── routes/              # API route definitions
│   └── calculator.routes.js
├── middlewares/         # Request validation & middleware
│   └── calculator.validator.js
├── prisma/              # Database schema & migrations
│   ├── schema.prisma
│   └── seed.js
├── index.js             # Application entry point
├── .env                 # Environment variables (not in repo)
├── .env.example         # Environment template
└── package.json         # Dependencies & scripts
```

### Request Flow

```
Client Request
    ↓
[CORS Middleware]
    ↓
[Rate Limiter]
    ↓
[Helmet Security]
    ↓
[Router]
    ↓
[Validator Middleware]
    ↓
[Controller]
    ↓
[Service Layer]
    ↓
[Model/Database]
    ↓
Response
```

---

## 📥 Instalasi dan Setup

### Prerequisites

Pastikan sistem Anda telah terinstall:

- **Node.js** versi 18 atau lebih tinggi
- **npm** (biasanya sudah include dengan Node.js)
- **PostgreSQL** versi 12 atau lebih tinggi
- **Git** (untuk clone repository)

### Langkah 1: Clone Repository

```bash
git clone https://github.com/daniadrian/kentangpas.git
cd kentangpas
```

### Langkah 2: Install Dependencies

```bash
npm install
```

### Langkah 3: Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi Anda:

```env
# Database Configuration
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"

# Server Configuration
PORT=4000
NODE_ENV=development

# Contoh:
# DATABASE_URL="postgresql://petani:petani123@localhost:5432/kalkulator_db?schema=public"
```

### Langkah 4: Setup Database

#### Buat Database PostgreSQL

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE kalkulator_db;

# Buat user (opsional)
CREATE USER petani WITH PASSWORD 'petani123';
GRANT ALL PRIVILEGES ON DATABASE kalkulator_db TO petani;

# Exit
\q
```

#### Generate Prisma Client

```bash
npx prisma generate
```

#### Jalankan Database Migration

```bash
npx prisma db push
```

#### Seed Database dengan Data Awal

```bash
npm run db:seed
```

Perintah ini akan mengisi database dengan parameter bibit untuk G0, G2, dan G3.

### Langkah 5: Verifikasi Database

```bash
# Buka Prisma Studio untuk melihat data
npx prisma studio
```

Prisma Studio akan membuka di `http://localhost:5555` dan Anda dapat melihat tabel `seed_parameters`.

---

## ▶️ Menjalankan Aplikasi

### Development Mode (dengan auto-reload)

```bash
npm run dev
```

Server akan berjalan di `http://localhost:4000` (atau port yang ditentukan di `.env`)

### Production Mode

```bash
npm start
```

### Health Check

Setelah aplikasi berjalan, test endpoint health check:

```bash
curl http://localhost:4000/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-27T10:30:00.000Z",
  "environment": "development"
}
```

---

## 📡 API Documentation

### Base URL

```
Development: http://localhost:4000/api
Production: https://api-bibitku.filkom.ub.ac.id/api
```

### Endpoints Overview

| Method | Endpoint               | Deskripsi                      |
| ------ | ---------------------- | ------------------------------ |
| GET    | `/`                    | Root endpoint & API info       |
| GET    | `/parameters`          | Get seed parameters            |
| POST   | `/calculator`          | Calculate seed needs (forward) |
| POST   | `/calculator/generate` | Alias untuk `/calculator`      |
| POST   | `/calculator/reverse`  | Calculate land area (reverse)  |
| GET    | `/health`              | Health check endpoint          |

---

### 1. Root Endpoint

**GET** `/api`

Mendapatkan informasi dasar API.

**Response:**

```json
{
  "success": true,
  "message": "API Kalkulator Tani Bromo siap digunakan!",
  "author": "Dani Adrian",
  "version": "1.0.0",
  "documentation": "/api-docs"
}
```

---

### 2. Get Seed Parameters

**GET** `/api/parameters`

Mendapatkan parameter bibit dari database (jumlah bibit per kg, harga satuan).

**Response:**

```json
{
  "success": true,
  "message": "Data parameter bibit berhasil diambil",
  "data": [
    {
      "id": 1,
      "generationName": "G0",
      "seedsPerKgMin": null,
      "seedsPerKgMax": null,
      "pricePerUnitMin": 500,
      "pricePerUnitMax": 800,
      "priceUnit": "biji",
      "createdAt": "2025-11-27T00:00:00.000Z"
    },
    {
      "id": 2,
      "generationName": "G2",
      "seedsPerKgMin": 15,
      "seedsPerKgMax": 15,
      "pricePerUnitMin": 15000,
      "pricePerUnitMax": 20000,
      "priceUnit": "kg",
      "createdAt": "2025-11-27T00:00:00.000Z"
    },
    {
      "id": 3,
      "generationName": "G3",
      "seedsPerKgMin": 12,
      "seedsPerKgMax": 18,
      "pricePerUnitMin": 12000,
      "pricePerUnitMax": 18000,
      "priceUnit": "kg",
      "createdAt": "2025-11-27T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Calculate Seed Needs (Forward)

**POST** `/api/calculator` atau `/api/calculator/generate`

Menghitung kebutuhan bibit berdasarkan dimensi lahan.

**Request Body:**

```json
{
  "generasiBibit": "G2",
  "panjangLahan": 100,
  "lebarLahan": 50,
  "lebarGuludan": 80,
  "lebarParit": 40,
  "jarakTanam": 30,
  "jumlahBibitPerKg": 15,
  "estimasiHarga": 18000,
  "estimasiHargaUnit": "kg"
}
```

**Parameter Details:**

| Parameter           | Type          | Required | Unit    | Deskripsi                             |
| ------------------- | ------------- | -------- | ------- | ------------------------------------- |
| `generasiBibit`     | string        | Ya       | -       | Generasi bibit: "G0", "G2", atau "G3" |
| `panjangLahan`      | number        | Ya       | meter   | Panjang lahan pertanian               |
| `lebarLahan`        | number        | Ya       | meter   | Lebar lahan pertanian                 |
| `lebarGuludan`      | number        | Tidak    | cm      | Lebar guludan (default: 80 cm)        |
| `lebarParit`        | number        | Ya       | cm      | Lebar parit/gerandul                  |
| `jarakTanam`        | number        | Ya       | cm      | Jarak antar tanaman                   |
| `jumlahBibitPerKg`  | number/object | Tidak    | biji/kg | Jumlah bibit per kg (atau {min, max}) |
| `estimasiHarga`     | number        | Tidak    | Rupiah  | Harga per unit                        |
| `estimasiHargaUnit` | string        | Tidak    | -       | "kg", "kuintal", atau "biji"          |

**Response:**

```json
{
  "success": true,
  "message": "Perhitungan berhasil dilakukan.",
  "data": {
    "ringkasanLahan": {
      "lebarUnitTanam": "1.20 meter",
      "jumlahGuludan": "41 baris",
      "panjangTanamPerGuludan": "100.00 meter"
    },
    "kebutuhanTanam": {
      "jumlahTanamanPerGuludan": "334 pohon",
      "totalPopulasiTanaman": "13.694 pohon"
    },
    "kebutuhanBibit": {
      "estimasi": "913 kg (9.13 kuintal)",
      "unit": "kg",
      "rangeKg": {
        "kg_min": 913,
        "kg_est": 913,
        "kg_max": 913
      },
      "note": "Angka perkiraan. Kebutuhan bisa lebih sedikit/lebih banyak tergantung ukuran umbi (biji/kg)."
    },
    "estimasiBiaya": {
      "total": "Rp 16.434.000"
    }
  }
}
```

---

### 4. Calculate Land Area (Reverse)

**POST** `/api/calculator/reverse`

Menghitung estimasi luas lahan berdasarkan jumlah bibit yang tersedia.

**Request Body:**

```json
{
  "generasiBibit": "G2",
  "jumlahBibit": 500,
  "jumlahPerKg": 15,
  "jarakTanam": 30,
  "lebarGuludan": 80,
  "lebarParit": 40
}
```

**Parameter Details:**

| Parameter       | Type   | Required    | Unit    | Deskripsi                                    |
| --------------- | ------ | ----------- | ------- | -------------------------------------------- |
| `generasiBibit` | string | Ya          | -       | Generasi bibit: "G0", "G2", atau "G3"        |
| `jumlahBibit`   | number | Ya          | biji/kg | Jumlah bibit (biji untuk G0, kg untuk G2/G3) |
| `jumlahPerKg`   | number | Kondisional | biji/kg | **Wajib** untuk G2/G3, jumlah umbi per kg    |
| `jarakTanam`    | number | Ya          | cm      | Jarak antar tanaman                          |
| `lebarGuludan`  | number | Tidak       | cm      | Lebar guludan (default: 80 cm)               |
| `lebarParit`    | number | Ya          | cm      | Lebar parit/gerandul                         |

**Response:**

```json
{
  "success": true,
  "message": "Perhitungan reverse berhasil",
  "data": {
    "ringkasan": {
      "estimasiLuasM2": "3,000.0",
      "jumlahGuludan": "42",
      "panjangPerGuludan": "59.5"
    },
    "estimasiPopulasi": {
      "totalTanaman": "7,500",
      "note": "Dengan 500 kg bibit G2 (estimasi 15 biji/kg = 7.500 bibit), Anda dapat menanam lahan seluas 3000.0 m² dengan jarak tanam 30 cm."
    }
  }
}
```

---

### Error Responses

#### Validation Error (422)

```json
{
  "message": "Input yang diberikan tidak valid.",
  "errors": [
    {
      "generasiBibit": "Generasi harus G0, G2, atau G3."
    }
  ]
}
```

#### Bad Request (400)

```json
{
  "success": false,
  "message": "Input tidak valid.",
  "error": "Detail error message"
}
```

#### Not Found (404)

```json
{
  "success": false,
  "error": "Route not found",
  "path": "/api/invalid-path"
}
```

#### Rate Limit (429)

```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

#### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 🔬 Logika Perhitungan

### Forward Calculation (Kebutuhan Bibit)

#### 1. Menghitung Jumlah Guludan

```javascript
U = lebarGuludan + lebarParit  // Unit tanam
J = floor(lebarLahan / U)      // Jumlah guludan penuh
sisa = lebarLahan - (J × U)    // Sisa lebar lahan

// Jika sisa >= 0.75m, tambah 1 guludan
J_final = sisa >= 0.75 ? J + 1 : J
```

#### 2. Menghitung Populasi Tanaman

```javascript
T_row = floor(panjangLahan / jarakTanam) + 1  // Tanaman per guludan
T_pop = J_final × T_row                        // Total populasi
```

#### 3. Menghitung Kebutuhan Bibit

**Untuk G0 (biji):**

```javascript
kebutuhanBibit = T_pop; // langsung dalam biji
```

**Untuk G2/G3 (kg):**

```javascript
kg_min = ceil(T_pop / seedsPerKg_max);
kg_max = ceil(T_pop / seedsPerKg_min);
kg_est = ceil((kg_min + kg_max) / 2);
```

#### 4. Estimasi Biaya

```javascript
// Konversi harga ke per kg jika dalam kuintal
priceKg = (unit === "kuintal") ? price / 100 : price

// Hitung total biaya
totalBiaya = priceKg × kebutuhanBibit
```

### Reverse Calculation (Estimasi Luas Lahan)

#### 1. Menghitung Total Tanaman

```javascript
// G0: langsung dalam biji
totalTanaman = (gen === "G0") ? jumlahBibit : jumlahBibit × jumlahPerKg
```

#### 2. Menghitung Dimensi Lahan

```javascript
lebarUnitTanam = lebarGuludan + lebarParit
targetRasio = 1.5  // Rasio panjang:lebar yang ideal

// Optimasi jumlah guludan
jumlahGuludan = round(sqrt(totalTanaman × jarakTanam / (targetRasio × lebarUnitTanam)))

tanamanPerGuludan = ceil(totalTanaman / jumlahGuludan)
panjangPerGuludan = tanamanPerGuludan × jarakTanam
lebarLahan = jumlahGuludan × lebarUnitTanam
estimasiLuasM2 = panjangPerGuludan × lebarLahan
```

---

## 🗄️ Database Schema

### Tabel: `seed_parameters`

| Column               | Type      | Constraints                 | Deskripsi                    |
| -------------------- | --------- | --------------------------- | ---------------------------- |
| `id`                 | INTEGER   | PRIMARY KEY, AUTO_INCREMENT | ID unik                      |
| `generation_name`    | VARCHAR   | UNIQUE, NOT NULL            | Nama generasi (G0/G2/G3)     |
| `seeds_per_kg_min`   | INTEGER   | NULLABLE                    | Minimum jumlah bibit per kg  |
| `seeds_per_kg_max`   | INTEGER   | NULLABLE                    | Maximum jumlah bibit per kg  |
| `price_per_unit_min` | INTEGER   | NULLABLE                    | Harga minimum per unit       |
| `price_per_unit_max` | INTEGER   | NULLABLE                    | Harga maximum per unit       |
| `price_unit`         | VARCHAR   | NOT NULL                    | Unit harga (kg/kuintal/biji) |
| `created_at`         | TIMESTAMP | DEFAULT NOW()               | Timestamp pembuatan          |

**Sample Data:**

```sql
INSERT INTO seed_parameters (generation_name, seeds_per_kg_min, seeds_per_kg_max, price_per_unit_min, price_per_unit_max, price_unit)
VALUES
  ('G0', NULL, NULL, 500, 800, 'biji'),
  ('G2', 15, 15, 15000, 20000, 'kg'),
  ('G3', 12, 18, 12000, 18000, 'kg');
```

---

## 🧪 Testing

### Manual Testing dengan cURL

#### Test Health Check

```bash
curl http://localhost:4000/health
```

#### Test Get Parameters

```bash
curl http://localhost:4000/api/parameters
```

#### Test Calculator (Forward)

```bash
curl -X POST http://localhost:4000/api/calculator \
  -H "Content-Type: application/json" \
  -d '{
    "generasiBibit": "G2",
    "panjangLahan": 100,
    "lebarLahan": 50,
    "lebarParit": 40,
    "jarakTanam": 30
  }'
```

#### Test Calculator (Reverse)

```bash
curl -X POST http://localhost:4000/api/calculator/reverse \
  -H "Content-Type: application/json" \
  -d '{
    "generasiBibit": "G2",
    "jumlahBibit": 500,
    "jumlahPerKg": 15,
    "jarakTanam": 30,
    "lebarParit": 40
  }'
```

### Testing dengan Postman

1. Import collection dari dokumentasi ini
2. Set environment variable `baseUrl` = `http://localhost:4000`
3. Jalankan collection runner

---

## 👥 Pengembangan

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/daniadrian/kentangpas.git
cd kentangpas

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
npx prisma generate
npx prisma db push
npm run db:seed

# Jalankan development server
npm run dev
```

### Git Workflow

```bash
# Buat branch baru untuk fitur
git checkout -b feature/nama-fitur

# Commit changes
git add .
git commit -m "feat: deskripsi fitur"

# Push ke remote
git push origin feature/nama-fitur

# Buat Pull Request di GitHub
```

### Commit Message Convention

Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Perubahan dokumentasi
- `style:` - Perubahan formatting
- `refactor:` - Refactoring code
- `test:` - Menambah/update test
- `chore:` - Maintenance tasks

**Contoh:**

```
feat: menambahkan validasi input tambahan
fix: memperbaiki perhitungan guludan
docs: update API documentation
```

---

## 📚 Resources untuk Developer

### Dokumentasi Teknologi

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

### Referensi Project

- **Repository**: [github.com/daniadrian/kentangpas](https://github.com/daniadrian/kentangpas)

---

## 📞 Kontak

### Developer

- **WhatsApp**: [+62 822-7749-2956](https://wa.me/6282277492956)

### Laboratorium Sistem Informasi

- **Lokasi**: Fakultas Ilmu Komputer, Universitas Brawijaya, Malang

---

## 🙏 Acknowledgments

Project ini dikembangkan sebagai bagian dari kegiatan penelitian dan pengembangan di:

- **Laboratorium Sistem Informasi**
- **Fakultas Ilmu Komputer**
- **Universitas Brawijaya**

Terima kasih kepada:

- Tim Laboratorium Sistem Informasi
- Para petani kentang yang telah memberikan insight

---

> _"Teknologi untuk Pertanian yang Lebih Baik"_
