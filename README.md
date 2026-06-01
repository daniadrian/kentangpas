# API Kalkulator Bibitku

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791.svg)](https://www.postgresql.org/)

> **API Backend untuk Aplikasi Kalkulator Bibitku**
> Dikembangkan oleh Laboratorium Sistem Informasi - Universitas Brawijaya

---

## Deskripsi Project

**API Kalkulator Bibitku** adalah sistem backend berbasis RESTful API untuk mendukung aplikasi kalkulator pertanian kentang. API ini menyediakan perhitungan kebutuhan bibit berdasarkan parameter lahan, mendukung tiga generasi bibit (G0, G2, G3), serta fitur perhitungan maju (forward) dan terbalik (reverse) untuk membantu petani dalam perencanaan budidaya.

Project ini merupakan bagian dari kegiatan penelitian dan pengembangan di **Laboratorium Sistem Informasi, Fakultas Ilmu Komputer, Universitas Brawijaya**.

---

## Fitur Utama

### 1. Perhitungan Kebutuhan Bibit (Forward)

Menghitung kebutuhan bibit berdasarkan dimensi lahan:

- Input: panjang/lebar lahan, lebar guludan, lebar parit, jarak tanam
- Output: jumlah guludan, total populasi tanaman, estimasi kebutuhan bibit (biji/kg/kuintal)
- Mendukung 3 generasi: **G0** (biji), **G2** (kg, 15 biji/kg), **G3** (kg, 12–18 biji/kg)

### 2. Estimasi Luas Lahan (Reverse)

Menghitung luas lahan yang diperlukan berdasarkan stok bibit:

- Input: jumlah bibit, jarak tanam, lebar guludan, lebar parit
- Output: estimasi luas lahan (m²), jumlah guludan, panjang per guludan
- Untuk G2/G3 dengan range biji/kg, output berupa **range min–max**

### 3. Estimasi Biaya

- Kalkulasi dari harga yang diinput user atau harga default dari database
- Mendukung unit **kg**, **kuintal**, dan **biji**
- Output berupa nilai tunggal atau range harga

### 4. Manajemen Parameter Bibit

- Database parameter per generasi (jumlah biji/kg, harga satuan min–max)
- Seed data awal tersedia via `npm run db:seed`
- Parameter dapat di-override per request via body JSON

### 5. Keamanan & Performa

- **CORS** — whitelist domain, support `ALLOWED_ORIGINS` via env
- **Rate Limiting** — maks 100 request per 15 menit per IP
- **Helmet** — HTTP security headers
- **Joi** — schema validation & sanitasi input di setiap endpoint

---

## Teknologi

| Kategori | Teknologi |
|---|---|
| Runtime | Node.js v20+ |
| Framework | Express.js v5.2.1 |
| ORM | Prisma v6.19.3 |
| Database | PostgreSQL |
| Validasi | Joi v18 |
| Keamanan | Helmet, CORS, express-rate-limit |
| Process Manager | PM2 (production VPS) |
| Deployment | Vercel / VPS + Nginx |
| Dev Tools | Nodemon, dotenv |

---

## Arsitektur

### Struktur Direktori

```
bibitku/
├── controllers/
│   └── calculator.controller.js     # Request handler, delegasi ke service
├── services/
│   └── calculator.service.js        # Logika perhitungan utama per generasi
├── models/
│   ├── calculator.entity.js         # SeedParameters entity class
│   └── calculator.repository.js     # Akses database via Prisma
├── middlewares/
│   └── calculator.validator.js      # Joi validation middleware
├── dtos/
│   ├── calculateSeedNeeds.dto.js    # Schema forward calculation
│   └── calculateReverseSeeds.dto.js # Schema reverse calculation
├── lib/
│   ├── calculator.helpers.js        # mergeSeedsPerKg, mergePrice, handler maps
│   └── prisma.js                    # Prisma client singleton
├── routes/
│   └── calculator.routes.js         # Definisi route
├── prisma/
│   ├── schema.prisma                # Database schema
│   ├── seed.js                      # Seed data awal
│   └── migrations/                  # Riwayat migration
├── ecosystem.config.js              # PM2 config (production)
├── vercel.json                      # Vercel deployment config
├── nginx-bibitku-api.conf           # Nginx reverse proxy config
├── index.js                         # Entry point aplikasi
└── .env.example                     # Template environment variables
```

### Alur Request

```
Client Request
    ↓
[CORS + Preflight Handler]
    ↓
[Rate Limiter]        ← /api/* saja
    ↓
[Helmet Security Headers]
    ↓
[Router]
    ↓
[Joi Validator Middleware]  ← validasi & parse DTO dari req.body → req.dto
    ↓
[Controller]               ← pilih handler berdasarkan generasiBibit
    ↓
[Service Layer]            ← logika kalkulasi per generasi
    ↓
[Repository]               ← query Prisma ke PostgreSQL
    ↓
Response JSON
```

### Pola Arsitektur

Project menggunakan pola **DTO + Repository**:

- **DTO** (`dtos/`) — Joi schema memvalidasi dan menormalisasi input sebelum masuk ke controller. Hasil validasi tersimpan di `req.dto`.
- **Entity** (`models/calculator.entity.js`) — kelas `SeedParameters` membungkus row database.
- **Repository** (`models/calculator.repository.js`) — semua query Prisma terpusat di sini.
- **Handler Maps** (`lib/calculator.helpers.js`) — `SEED_NEEDS_HANDLERS` dan `REVERSE_SEEDS_HANDLERS` memetakan generasi ke fungsi service yang tepat, sehingga controller tidak perlu `if/else` per generasi.

---

## Instalasi dan Setup

### Prerequisites

- **Node.js** v20 atau lebih tinggi
- **npm** (sudah bundled dengan Node.js)
- **PostgreSQL** v12 atau lebih tinggi
- **Git**

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

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Wajib
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Opsional
PORT=4000
NODE_ENV=development

# CORS tambahan (comma-separated, opsional)
ALLOWED_ORIGINS=https://your-frontend.com
```

> Origin yang selalu diizinkan (hardcoded): `https://bibitku.site`, `https://www.bibitku.site`, `http://localhost:3000`, `http://localhost:5173`

### Langkah 4: Setup Database

```bash
# Buat database di PostgreSQL
psql -U postgres -c "CREATE DATABASE kalkulator_db;"

# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push

# Isi data awal (G0, G2, G3)
npm run db:seed
```

### Langkah 5: Jalankan Aplikasi

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:4000` (atau `PORT` dari `.env`).

### Verifikasi

```bash
curl http://localhost:4000/health
```

```json
{
  "status": "ok",
  "timestamp": "2025-11-27T10:30:00.000Z",
  "environment": "development"
}
```

---

## API Documentation

### Base URL

```
Development : http://localhost:4000/api
Production  : https://api-bibitku.filkom.ub.ac.id/api
```

### Ringkasan Endpoint

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api` | Info API |
| GET | `/api/parameters` | Ambil parameter bibit dari DB |
| POST | `/api/calculator` | Hitung kebutuhan bibit (forward) |
| POST | `/api/calculator/reverse` | Estimasi luas lahan (reverse) |

---

### GET `/health`

Health check server.

**Response 200:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-27T10:30:00.000Z",
  "environment": "development"
}
```

---

### GET `/api`

Info dasar API.

**Response 200:**

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

### GET `/api/parameters`

Ambil semua parameter bibit dari database.

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

### POST `/api/calculator`

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

**Parameter:**

| Field | Tipe | Wajib | Satuan | Default | Deskripsi |
|---|---|---|---|---|---|
| `generasiBibit` | string | Ya | — | — | `"G0"`, `"G2"`, atau `"G3"` |
| `panjangLahan` | number | Ya | meter | — | Panjang lahan |
| `lebarLahan` | number | Ya | meter | — | Lebar lahan |
| `lebarGuludan` | number | Tidak | cm | `80` | Lebar guludan |
| `lebarParit` | number | Ya | cm | — | Lebar parit/gerandul |
| `jarakTanam` | number | Ya | cm | — | Jarak antar tanaman |
| `jumlahBibitPerKg` | number \| `{min,max}` | Tidak | biji/kg | dari DB | Override jumlah biji per kg |
| `estimasiHarga` | number | Tidak | Rupiah | — | Override harga per unit |
| `estimasiHargaUnit` | string | Tidak | — | — | `"kg"`, `"kuintal"`, atau `"biji"` |

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

> Untuk **G0**: `kebutuhanBibit.unit` bernilai `"biji"`, `rangeKg` bernilai `null`, dan `estimasiBiaya` dihitung per biji.

---

### POST `/api/calculator/reverse`

Menghitung estimasi luas lahan berdasarkan stok bibit yang dimiliki.

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

**Parameter:**

| Field | Tipe | Wajib | Satuan | Default | Deskripsi |
|---|---|---|---|---|---|
| `generasiBibit` | string | Ya | — | — | `"G0"`, `"G2"`, atau `"G3"` |
| `jumlahBibit` | number | Ya | biji (G0) / kg (G2/G3) | — | Stok bibit yang dimiliki |
| `jarakTanam` | number | Ya | cm | — | Jarak antar tanaman |
| `lebarGuludan` | number | Tidak | cm | `80` | Lebar guludan |
| `lebarParit` | number | Ya | cm | — | Lebar parit/gerandul |
| `jumlahPerKg` | number | Tidak | biji/kg | dari DB | Override jumlah biji per kg (G2/G3) |

**Response 200 — G2/G3 (range):**

```json
{
  "success": true,
  "message": "Perhitungan reverse berhasil",
  "data": {
    "ringkasan": {
      "estimasiLuasM2": { "min": "3.000,0", "max": "4.500,0" },
      "jumlahGuludan": { "min": "42", "max": "51" },
      "panjangPerGuludan": { "min": "59,5", "max": "73,2" }
    },
    "estimasiPopulasi": {
      "totalTanaman": { "min": "7.500", "max": "9.000" },
      "note": "Dengan 500 kg bibit G3 (estimasi 12–18 biji/kg), estimasi lahan yang dibutuhkan 3000,0–4500,0 m² dengan jarak tanam 30 cm."
    }
  }
}
```

> Jika `seedsPerKgMin === seedsPerKgMax` (mis. G2), output `estimasiLuasM2` berupa string tunggal, bukan object `{min, max}`.

**Response 200 — G0:**

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
      "note": "Dengan 7.500 biji bibit G0, estimasi lahan yang dibutuhkan 3000,0 m² dengan jarak tanam 30 cm."
    },
    "estimasiBiaya": {
      "total": "Rp 3.750.000"
    }
  }
}
```

---

### Error Responses

#### 422 — Validation Error

```json
{
  "message": "Input yang diberikan tidak valid.",
  "errors": [
    { "generasiBibit": "Generasi harus G0, G2, atau G3." }
  ]
}
```

#### 400 — Bad Request

```json
{
  "success": false,
  "message": "Generasi bibit tidak dikenali: G5"
}
```

#### 404 — Not Found

```json
{
  "success": false,
  "error": "Route not found",
  "path": "/api/invalid-path"
}
```

#### 429 — Rate Limit

```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

#### 500 — Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Logika Perhitungan

### Forward — Hitung Kebutuhan Bibit

#### 1. Grid Tanam

```
U       = lebarGuludan + lebarParit          (unit tanam, meter)
J       = floor(lebarLahan / U)              (guludan penuh)
sisa    = lebarLahan - (J × U)
J_final = J + (sisa >= 0.75 ? 1 : 0)        (tambah guludan jika sisa ≥ 75 cm)
T_row   = floor(panjangLahan / jarakTanam) + 1
T_pop   = J_final × T_row
```

#### 2. Kebutuhan Bibit

**G0:**
```
kebutuhanBibit = T_pop  (dalam biji)
```

**G2 / G3:**
```
kg_min = ceil(T_pop / seedsPerKg_max)
kg_max = ceil(T_pop / seedsPerKg_min)
kg_est = ceil((kg_min + kg_max) / 2)
```

#### 3. Estimasi Biaya

```
priceKg   = (unit === "kuintal") ? price / 100 : price
totalBiaya = priceKg × kg_est   (atau T_pop untuk G0)
```

---

### Reverse — Estimasi Luas Lahan

#### 1. Total Tanaman

```
G0 : totalTanaman = jumlahBibit
G2/G3 : totalTanaman = jumlahBibit × seedsPerKg  (dihitung untuk min dan max)
```

#### 2. Dimensi Lahan (target rasio panjang:lebar = 1.5)

```
lebarUnitTanam = lebarGuludan + lebarParit
jumlahGuludan  = round(sqrt(totalTanaman × jarakTanam / (1.5 × lebarUnitTanam)))
tanamanPerGuludan = ceil(totalTanaman / jumlahGuludan)
panjangPerGuludan = tanamanPerGuludan × jarakTanam
lebarLahan        = jumlahGuludan × lebarUnitTanam
estimasiLuasM2    = panjangPerGuludan × lebarLahan
```

> Untuk G2/G3 dengan range biji/kg, kalkulasi dijalankan dua kali (untuk `seedsPerKgMin` dan `seedsPerKgMax`) dan hasilnya disajikan sebagai range.

---

## Database Schema

### Tabel: `seed_parameters`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | INTEGER | PK, AUTO | ID unik |
| `generation_name` | VARCHAR | UNIQUE, NOT NULL | Generasi bibit (G0/G2/G3) |
| `seeds_per_kg_min` | INTEGER | NULLABLE | Min biji per kg |
| `seeds_per_kg_max` | INTEGER | NULLABLE | Max biji per kg |
| `price_per_unit_min` | INTEGER | NULLABLE | Harga minimum per unit |
| `price_per_unit_max` | INTEGER | NULLABLE | Harga maksimum per unit |
| `price_unit` | VARCHAR | NOT NULL | Unit harga: `kg`, `kuintal`, `biji` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu dibuat |

**Data Awal (seed):**

```sql
INSERT INTO seed_parameters VALUES
  ('G0', NULL, NULL, 500,   800,   'biji'),
  ('G2', 15,   15,   15000, 20000, 'kg'),
  ('G3', 12,   18,   12000, 18000, 'kg');
```

---

## Deployment

Project mendukung dua opsi deployment.

### Opsi 1: Vercel (Serverless)

Sudah dikonfigurasi via `vercel.json`. Deploy langsung dari GitHub atau Vercel CLI:

```bash
vercel --prod
```

Pastikan environment variable `DATABASE_URL` sudah diset di dashboard Vercel.

### Opsi 2: VPS + PM2 + Nginx

Gunakan `ecosystem.config.js` untuk menjalankan dengan PM2:

```bash
# Install PM2 global
npm install -g pm2

# Start aplikasi
pm2 start ecosystem.config.js

# Simpan process list
pm2 save
pm2 startup
```

Konfigurasi Nginx reverse proxy tersedia di `nginx-bibitku-api.conf`.

Script deploy otomatis tersedia di `deploy.sh`.

---

## Testing

### cURL

```bash
# Health check
curl http://localhost:4000/health

# Get parameters
curl http://localhost:4000/api/parameters

# Forward — G2
curl -X POST http://localhost:4000/api/calculator \
  -H "Content-Type: application/json" \
  -d '{
    "generasiBibit": "G2",
    "panjangLahan": 100,
    "lebarLahan": 50,
    "lebarParit": 40,
    "jarakTanam": 30
  }'

# Reverse — G3
curl -X POST http://localhost:4000/api/calculator/reverse \
  -H "Content-Type: application/json" \
  -d '{
    "generasiBibit": "G3",
    "jumlahBibit": 500,
    "jarakTanam": 30,
    "lebarParit": 40
  }'
```

### Prisma Studio

```bash
npx prisma studio
# Buka http://localhost:5555 untuk melihat data di tabel seed_parameters
```

---

## Git Workflow

```bash
# Buat branch fitur
git checkout -b feature/nama-fitur

# Commit dengan Conventional Commits
git commit -m "feat: deskripsi fitur baru"
git commit -m "fix: perbaiki perhitungan guludan"
git commit -m "refactor: pisah logika kalkulasi per generasi"

# Push dan buat Pull Request
git push origin feature/nama-fitur
```

**Format Conventional Commits:** `feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore`

---

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Joi Validation](https://joi.dev/api/)
- [Repository](https://github.com/daniadrian/kentangpas)

---

## Kontak

- **Developer**: Dani Adrian — [WhatsApp](https://wa.me/6282277492956)
- **Institusi**: Laboratorium Sistem Informasi, Fakultas Ilmu Komputer, Universitas Brawijaya, Malang

---

> *"Teknologi untuk Pertanian yang Lebih Baik"*
