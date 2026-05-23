# API Kalkulator Bibitku — Dokumentasi Teknis

> Sistem Backend Perhitungan Kebutuhan Bibit Kentang
> Dikembangkan oleh **Laboratorium Sistem Informasi, Fakultas Ilmu Komputer, Universitas Brawijaya**

---

## Daftar Isi

1. [Deskripsi Project](#1-deskripsi-project)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Database Schema](#4-database-schema)
5. [API Documentation](#5-api-documentation)
6. [Logika Perhitungan](#6-logika-perhitungan)
7. [Panduan Instalasi](#7-panduan-instalasi)
8. [Deployment](#8-deployment)
9. [Informasi Project](#9-informasi-project)

---

## 1. Deskripsi Project

**API Kalkulator Bibitku** adalah sistem backend berbasis RESTful API yang dirancang untuk mendukung aplikasi kalkulator pertanian kentang. API ini menyediakan perhitungan kebutuhan bibit kentang berdasarkan parameter lahan pertanian, mendukung berbagai generasi bibit (G0, G2, G3), serta menyediakan fitur perhitungan maju (forward) dan terbalik (reverse) untuk membantu petani dalam perencanaan budidaya kentang.

### Tujuan Project

| # | Tujuan | Keterangan |
|---|--------|------------|
| 1 | **Akademis** | Platform penelitian dan pengembangan sistem informasi pertanian |
| 2 | **Praktis** | Membantu petani menghitung kebutuhan bibit kentang secara akurat |
| 3 | **Edukasi** | Pembelajaran teknologi web API dalam konteks pertanian |
| 4 | **Keberlanjutan** | Sistem yang dapat dikembangkan oleh generasi berikutnya |

### Fitur Utama

#### 1. Perhitungan Kebutuhan Bibit (Forward Calculation)
- **Input:** Panjang lahan, lebar lahan, lebar guludan, lebar parit, jarak tanam
- **Output:** Jumlah guludan, total populasi tanaman, estimasi kebutuhan bibit (kg/kuintal)
- Mendukung 3 generasi bibit: **G0** (biji), **G2** (kg), **G3** (kg)

#### 2. Perhitungan Estimasi Luas Lahan (Reverse Calculation)
- **Input:** Jumlah bibit, jarak tanam, lebar guludan, lebar parit
- **Output:** Estimasi luas lahan (m²), jumlah guludan, panjang per guludan

#### 3. Estimasi Biaya
- Menghitung estimasi biaya bibit berdasarkan harga per kg atau kuintal
- Range harga (minimum–maximum) untuk berbagai skenario
- Sumber harga dari database atau input user

#### 4. Manajemen Parameter Bibit
- Database parameter untuk setiap generasi bibit (G0, G2, G3)
- Informasi jumlah bibit per kg dan harga satuan
- Update parameter melalui database seeding

#### 5. Security & Performance
- **CORS:** Whitelist domain tertentu
- **Rate Limiting:** Maksimal 100 request per 15 menit
- **Helmet:** HTTP security headers
- **Input Validation:** `express-validator` untuk semua endpoint

---

## 2. Teknologi yang Digunakan

### Backend Framework & Runtime

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Node.js | `>=20.0.0` | JavaScript runtime environment |
| Express.js | `^5.2.1` | Web application framework |
| Prisma ORM | `^6.19.3` | Database toolkit dan ORM |

### Database

| Teknologi | Keterangan |
|-----------|------------|
| PostgreSQL | Relational database management system |

### Security & Middleware

| Package | Versi | Fungsi |
|---------|-------|--------|
| `helmet` | `^8.1.0` | Security headers untuk Express |
| `cors` | `^2.8.6` | Cross-Origin Resource Sharing |
| `express-rate-limit` | `^8.5.1` | API rate limiting |
| `express-validator` | `^7.3.2` | Request validation & sanitization |
| `dotenv` | `^17.4.2` | Environment variable management |

### Development Tools

| Package | Versi | Fungsi |
|---------|-------|--------|
| `nodemon` | `^3.1.14` | Auto-restart server saat development |
| `prisma` (CLI) | `^6.19.3` | Database migration & schema tool |

---

## 3. Arsitektur Sistem

### Struktur Folder (MVC)

```
bibitku/
├── controllers/           # Business logic & request handling
│   └── calculator.controller.js
├── services/              # Core calculation & business logic
│   └── calculator.service.js
├── models/                # Database interaction layer
│   └── calculator.model.js
├── routes/                # API route definitions
│   └── calculator.routes.js
├── middlewares/           # Request validation & middleware
│   └── calculator.validator.js
├── lib/                   # Shared utilities
│   └── prisma.js
├── prisma/                # Database schema & migrations
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── index.js               # Application entry point
├── vercel.json            # Vercel deployment config
├── .env                   # Environment variables (tidak di-commit)
├── .env.example           # Template environment variables
└── package.json           # Dependencies & scripts
```

### Request Flow

```
Client Request
    ↓
[CORS Middleware]       — Whitelist: bibitku.site, localhost:3000, localhost:5173
    ↓
[Rate Limiter]          — Max 100 req / 15 menit per IP
    ↓
[Helmet Security]       — HTTP security headers
    ↓
[Router]                — /api/* routes
    ↓
[Validator Middleware]  — express-validator rules
    ↓
[Controller]            — Handle request, panggil service
    ↓
[Service Layer]         — Logika kalkulasi
    ↓
[Model / Database]      — Prisma ORM → PostgreSQL
    ↓
Response (JSON)
```

### CORS Whitelist

```
https://bibitku.site
https://www.bibitku.site
http://10.34.0.33          (internal network)
http://localhost:3000       (development)
http://localhost:5173       (Vite dev server)
+ origins dari env ALLOWED_ORIGINS
```

---

## 4. Database Schema

### Tabel: `seed_parameters`

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | `INTEGER` | PK, AUTO_INCREMENT | ID unik record |
| `generation_name` | `VARCHAR` | UNIQUE, NOT NULL | Nama generasi (G0/G2/G3) |
| `seeds_per_kg_min` | `INTEGER` | NULLABLE | Min. jumlah bibit per kg |
| `seeds_per_kg_max` | `INTEGER` | NULLABLE | Max. jumlah bibit per kg |
| `price_per_unit_min` | `INTEGER` | NULLABLE | Harga minimum per unit (Rp) |
| `price_per_unit_max` | `INTEGER` | NULLABLE | Harga maximum per unit (Rp) |
| `price_unit` | `VARCHAR` | NOT NULL | Unit harga: `kg` / `kuintal` / `biji` |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Waktu pembuatan record |

### Data Seed Awal

| generation_name | seeds_per_kg_min | seeds_per_kg_max | price_min | price_max | price_unit |
|-----------------|-----------------|-----------------|-----------|-----------|------------|
| G0 | NULL | NULL | 500 | 800 | biji |
| G2 | 15 | 15 | 15.000 | 20.000 | kg |
| G3 | 12 | 18 | 12.000 | 18.000 | kg |

### Prisma Schema

```prisma
model SeedParameters {
  id              Int      @id @default(autoincrement())
  generationName  String   @unique @map("generation_name")
  seedsPerKgMin   Int?     @map("seeds_per_kg_min")
  seedsPerKgMax   Int?     @map("seeds_per_kg_max")
  pricePerUnitMin Int?     @map("price_per_unit_min")
  pricePerUnitMax Int?     @map("price_per_unit_max")
  priceUnit       String   @map("price_unit")
  createdAt       DateTime @default(now()) @map("created_at")

  @@map("seed_parameters")
}
```

---

## 5. API Documentation

**Base URL:**
- Development: `http://localhost:4000/api`
- Production: `https://api-bibitku.filkom.ub.ac.id/api`

### Endpoints Overview

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/` | Root endpoint & API info |
| `GET` | `/parameters` | Get seed parameters dari database |
| `POST` | `/calculator` | Hitung kebutuhan bibit (forward) |
| `POST` | `/calculator/generate` | Alias untuk `/calculator` |
| `POST` | `/calculator/reverse` | Hitung estimasi luas lahan (reverse) |
| `GET` | `/health` | Health check endpoint |

---

### GET `/api/parameters`

Mendapatkan parameter bibit dari database.

**Response 200:**
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
      "priceUnit": "biji"
    },
    {
      "id": 2,
      "generationName": "G2",
      "seedsPerKgMin": 15,
      "seedsPerKgMax": 15,
      "pricePerUnitMin": 15000,
      "pricePerUnitMax": 20000,
      "priceUnit": "kg"
    },
    {
      "id": 3,
      "generationName": "G3",
      "seedsPerKgMin": 12,
      "seedsPerKgMax": 18,
      "pricePerUnitMin": 12000,
      "pricePerUnitMax": 18000,
      "priceUnit": "kg"
    }
  ]
}
```

---

### POST `/api/calculator` — Forward Calculation

Menghitung kebutuhan bibit berdasarkan dimensi lahan.

**Request Body:**

| Parameter | Tipe | Required | Unit | Deskripsi |
|-----------|------|----------|------|-----------|
| `generasiBibit` | string | Ya | — | `"G0"`, `"G2"`, atau `"G3"` |
| `panjangLahan` | number | Ya | meter | Panjang lahan pertanian |
| `lebarLahan` | number | Ya | meter | Lebar lahan pertanian |
| `lebarGuludan` | number | Tidak | cm | Lebar guludan (default: 80) |
| `lebarParit` | number | Ya | cm | Lebar parit/gerandul |
| `jarakTanam` | number | Ya | cm | Jarak antar tanaman |
| `jumlahBibitPerKg` | number/object | Tidak | biji/kg | Jumlah bibit per kg |
| `estimasiHarga` | number | Tidak | Rp | Harga per unit |
| `estimasiHargaUnit` | string | Tidak | — | `"kg"`, `"kuintal"`, atau `"biji"` |

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

**Response 200:**
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
      "rangeKg": { "kg_min": 913, "kg_est": 913, "kg_max": 913 },
      "note": "Angka perkiraan. Kebutuhan bisa lebih sedikit/lebih banyak tergantung ukuran umbi (biji/kg)."
    },
    "estimasiBiaya": {
      "total": "Rp 16.434.000"
    }
  }
}
```

---

### POST `/api/calculator/reverse` — Reverse Calculation

Menghitung estimasi luas lahan berdasarkan jumlah bibit yang tersedia.

**Request Body:**

| Parameter | Tipe | Required | Unit | Deskripsi |
|-----------|------|----------|------|-----------|
| `generasiBibit` | string | Ya | — | `"G0"`, `"G2"`, atau `"G3"` |
| `jumlahBibit` | number | Ya | biji/kg | Jumlah bibit |
| `jumlahPerKg` | number | Wajib untuk G2/G3 | biji/kg | Jumlah umbi per kg |
| `jarakTanam` | number | Ya | cm | Jarak antar tanaman |
| `lebarGuludan` | number | Tidak | cm | Lebar guludan (default: 80) |
| `lebarParit` | number | Ya | cm | Lebar parit |

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

**Response 200:**
```json
{
  "success": true,
  "message": "Perhitungan reverse berhasil",
  "data": {
    "ringkasan": {
      "estimasiLuasM2": "3.000,0",
      "jumlahGuludan": "42",
      "panjangPerGuludan": "59,5"
    },
    "estimasiPopulasi": {
      "totalTanaman": "7.500",
      "note": "Dengan 500 kg bibit G2 (estimasi 15 biji/kg = 7.500 bibit), Anda dapat menanam lahan seluas 3000.0 m² dengan jarak tanam 30 cm."
    }
  }
}
```

---

### Error Responses

| HTTP Status | Kondisi | Contoh Response |
|-------------|---------|-----------------|
| `422` | Validation Error | `{ "message": "Input tidak valid.", "errors": [...] }` |
| `400` | Bad Request | `{ "success": false, "message": "Input tidak valid.", "error": "..." }` |
| `404` | Not Found | `{ "success": false, "error": "Route not found", "path": "/api/..." }` |
| `429` | Too Many Requests | `{ "success": false, "error": "Too many requests from this IP..." }` |
| `500` | Server Error | `{ "success": false, "error": "Internal server error" }` |

---

## 6. Logika Perhitungan

### Forward Calculation (Kebutuhan Bibit)

#### Langkah 1: Jumlah Guludan

```
U        = lebarGuludan + lebarParit       // Unit tanam (meter)
J        = floor(lebarLahan / U)           // Jumlah guludan penuh
sisa     = lebarLahan - (J × U)            // Sisa lebar lahan

J_final  = sisa >= 0.75 ? J + 1 : J       // Tambah guludan jika sisa >= 75cm
```

#### Langkah 2: Populasi Tanaman

```
T_row = floor(panjangLahan / jarakTanam) + 1   // Tanaman per guludan
T_pop = J_final × T_row                         // Total populasi
```

#### Langkah 3: Kebutuhan Bibit

```
// G0 (biji):
kebutuhanBibit = T_pop

// G2 / G3 (kg):
kg_min = ceil(T_pop / seedsPerKg_max)
kg_max = ceil(T_pop / seedsPerKg_min)
kg_est = ceil((kg_min + kg_max) / 2)
```

#### Langkah 4: Estimasi Biaya

```
// Konversi ke per-kg jika unit kuintal
priceKg    = (unit === "kuintal") ? price / 100 : price
totalBiaya = priceKg × kebutuhanBibit
```

---

### Reverse Calculation (Estimasi Luas Lahan)

#### Langkah 1: Total Tanaman

```
// G0: langsung biji
// G2/G3: konversi dari kg
totalTanaman = (gen === "G0") ? jumlahBibit : jumlahBibit × jumlahPerKg
```

#### Langkah 2: Optimasi Dimensi Lahan

```
lebarUnitTanam = lebarGuludan + lebarParit
targetRasio    = 1.5   // rasio panjang:lebar ideal

jumlahGuludan    = round(sqrt(totalTanaman × jarakTanam / (targetRasio × lebarUnitTanam)))
tanamanPerGuludan = ceil(totalTanaman / jumlahGuludan)
panjangPerGuludan = tanamanPerGuludan × jarakTanam
lebarLahan        = jumlahGuludan × lebarUnitTanam
estimasiLuasM2    = panjangPerGuludan × lebarLahan
```

---

## 7. Panduan Instalasi

### Prerequisites

- Node.js `>= 20.0.0`
- npm (sudah include dengan Node.js)
- PostgreSQL `>= 12`
- Git

### Setup Lokal

```bash
# 1. Clone repository
git clone https://github.com/daniadrian/kentangpas.git
cd kentangpas

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env sesuai konfigurasi lokal
```

**Isi file `.env`:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS="https://custom-domain.com"   # opsional
```

```bash
# 4. Buat database PostgreSQL
psql -U postgres -c "CREATE DATABASE kalkulator_db;"

# 5. Generate Prisma client & jalankan schema
npx prisma generate
npx prisma db push

# 6. Seed data awal (G0, G2, G3)
npm run db:seed

# 7. Jalankan server
npm run dev      # development (auto-reload)
npm start        # production
```

### npm Scripts

| Script | Command | Kegunaan |
|--------|---------|----------|
| `npm start` | `node index.js` | Jalankan server production |
| `npm run dev` | `nodemon index.js` | Jalankan server development |
| `npm run db:seed` | `npx prisma db seed` | Seed database dengan data awal |

### Verifikasi

```bash
curl http://localhost:4000/health
# → { "status": "ok", "timestamp": "...", "environment": "development" }

curl http://localhost:4000/api/parameters
# → { "success": true, "data": [...] }
```

---

## 8. Deployment

### Vercel (`vercel.json`)

```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [
    {
      "src": "/api/(.*)",
      "methods": ["OPTIONS"],
      "headers": {
        "Access-Control-Allow-Origin": "https://www.bibitku.site",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      },
      "status": 204
    },
    { "src": "/(.*)", "dest": "index.js" }
  ]
}
```

### Environment Variables (Production)

| Variable | Contoh Nilai | Keterangan |
|----------|--------------|------------|
| `DATABASE_URL` | `postgresql://...` | Connection string PostgreSQL |
| `PORT` | `4000` | Port server |
| `NODE_ENV` | `production` | Environment mode |
| `ALLOWED_ORIGINS` | `https://custom.com` | Tambahan CORS origins (opsional) |

### PM2 (`ecosystem.config.js`)

```js
module.exports = {
  apps: [{
    name: "bibitku-api",
    script: "index.js",
    instances: 1,
    autorestart: true,
    env: { NODE_ENV: "production", PORT: 4000 }
  }]
};
```

### Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name api-bibitku.filkom.ub.ac.id;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 9. Informasi Project

| Field | Detail |
|-------|--------|
| **Nama Package** | `bibitku` |
| **Versi** | `1.0.0` |
| **Repository** | [github.com/daniadrian/kentangpas](https://github.com/daniadrian/kentangpas) |
| **License** | ISC |

### Developer

| | |
|-|-|
| **Nama** | Dani Adrian |
| **WhatsApp** | +62 822-7749-2956 |

### Institusi

| | |
|-|-|
| **Laboratorium** | Laboratorium Sistem Informasi |
| **Fakultas** | Fakultas Ilmu Komputer |
| **Universitas** | Universitas Brawijaya, Malang |

### Git Commit Convention

| Prefix | Kegunaan |
|--------|----------|
| `feat:` | Fitur baru |
| `fix:` | Bug fix |
| `docs:` | Perubahan dokumentasi |
| `style:` | Perubahan formatting |
| `refactor:` | Refactoring code |
| `test:` | Menambah/update test |
| `chore:` | Maintenance tasks |

---

> *"Teknologi untuk Pertanian yang Lebih Baik"*
