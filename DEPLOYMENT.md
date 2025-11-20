# 🚀 Panduan Deployment kentangpas Backend ke VPS

## 📋 Informasi VPS
- **IP Internal**: 10.34.0.33
- **IP Gateway**: 175.45.187.247
- **Hostname**: 01-labsi-bibitku
- **OS**: Ubuntu 22.04 LTS
- **Port Backend**: 4000
- **Domain Frontend**: http://bibitku.filkom.ub.ac.id
- **Domain Backend**: http://api-bibitku.filkom.ub.ac.id

## 📦 Prasyarat di VPS
Pastikan VPS sudah terinstall:
- Node.js (v18 atau lebih baru)
- npm
- PostgreSQL
- PM2
- Nginx
- Git

---

## 🔧 Langkah 1: Persiapan VPS

### 1.1 SSH ke VPS
```bash
ssh root@10.34.0.33
# Masukkan password dari admin
```

### 1.2 Install Node.js (jika belum)
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### 1.3 Install PM2 (jika belum)
```bash
npm install -g pm2

# Setup PM2 startup
pm2 startup
# Ikuti instruksi yang muncul
```

### 1.4 Install PostgreSQL (jika belum)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
sudo systemctl status postgresql
```

---

## 🗄️ Langkah 2: Setup Database

### 2.1 Buat Database dan User
```bash
# Masuk ke PostgreSQL
sudo -u postgres psql

# Di dalam psql, jalankan:
CREATE DATABASE kalkulator_db;
CREATE USER petani WITH ENCRYPTED PASSWORD 'petani123';
GRANT ALL PRIVILEGES ON DATABASE kalkulator_db TO petani;
ALTER DATABASE kalkulator_db OWNER TO petani;
\q
```

### 2.2 Test Koneksi Database
```bash
# Test koneksi
psql -h localhost -U petani -d kalkulator_db
# Masukkan password: petani123
# Jika berhasil, ketik \q untuk keluar
```

---

## 📥 Langkah 3: Clone Project dari GitHub

### 3.1 Clone Repository
```bash
# Buat folder untuk backend
cd /var/www

# Clone dari GitHub
git clone https://github.com/daniadrian/kentangpas.git bibitku-be
cd bibitku-be

# Verify struktur
ls -la
```

### 3.2 Install Dependencies
```bash
npm install --production
```

---

## ⚙️ Langkah 4: Konfigurasi Environment

### 4.1 Buat File .env
```bash
cd /var/www/bibitku-be

# Copy dari example
cp .env.example .env

# Edit .env
nano .env
```

### 4.2 Isi File .env
```env
# Database Configuration
DATABASE_URL="postgresql://petani:petani123@localhost:5432/kalkulator_db?schema=public"

# Server Configuration
PORT=4000
NODE_ENV=production
```

### 4.3 Set Permissions
```bash
chmod 600 .env
chmod 700 /var/www/bibitku-be
```

---

## 🔄 Langkah 5: Setup Prisma & Database Migration

### 5.1 Generate Prisma Client
```bash
cd /var/www/bibitku-be
npx prisma generate
```

### 5.2 Run Migrations
```bash
# Deploy migrations ke database
npx prisma migrate deploy
```

### 5.3 Run Seeder (Data Awal)
```bash
npm run db:seed
```

### 5.4 Verify Database
```bash
# Cek tabel yang terbuat
psql -h localhost -U petani -d kalkulator_db -c "\dt"

# Cek data seed
psql -h localhost -U petani -d kalkulator_db -c "SELECT * FROM seed_parameters;"
```

---

## 🚀 Langkah 6: Setup PM2

### 6.1 Buat Folder Log
```bash
sudo mkdir -p /var/log/pm2
sudo chmod 755 /var/log/pm2
```

### 6.2 Start Aplikasi dengan PM2
```bash
cd /var/www/bibitku-be

# Start menggunakan ecosystem config
pm2 start ecosystem.config.js

# Verify aplikasi running
pm2 status
pm2 logs bibitku-be --lines 50
```

### 6.3 Save PM2 Configuration
```bash
# Save configuration agar auto-start saat reboot
pm2 save
```

### 6.4 Test Backend Lokal
```bash
# Test health endpoint
curl http://localhost:4000/health

# Test API endpoint
curl http://localhost:4000/api/calculator/generate
```

---

## 🌐 Langkah 7: Configure Nginx

### 7.1 Buat Nginx Configuration untuk Backend (Subdomain Terpisah)

Backend akan menggunakan subdomain terpisah: **api-bibitku.filkom.ub.ac.id**

```bash
# Buat config baru untuk backend API
sudo nano /etc/nginx/sites-available/bibitku-api
```

### 7.2 Isi Configuration File
Masukkan konfigurasi berikut:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name api-bibitku.filkom.ub.ac.id;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root location - proxy semua request ke backend
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logs
    access_log /var/log/nginx/bibitku_api_access.log;
    error_log /var/log/nginx/bibitku_api_error.log;
}
```

### 7.3 Enable Configuration
```bash
# Buat symbolic link ke sites-enabled
sudo ln -s /etc/nginx/sites-available/bibitku-api /etc/nginx/sites-enabled/

# Verify symbolic link dibuat
ls -la /etc/nginx/sites-enabled/ | grep bibitku-api
```

### 7.4 Test & Reload Nginx
```bash
# Test configuration
sudo nginx -t

# Jika OK, reload
sudo systemctl reload nginx
```

### 7.5 PENTING: Minta Admin Setup DNS
⚠️ **Sebelum bisa diakses dari luar, minta admin network/DNS untuk menambahkan record:**

```
Hostname: api-bibitku.filkom.ub.ac.id
Type: A Record
Target: 175.45.187.247 (atau internal: 10.34.0.33)
```

Koordinasi dengan admin yang mengelola DNS filkom.ub.ac.id!

---

## ✅ Langkah 8: Testing & Verification

### 8.1 Test dari VPS
```bash
# Test direct ke backend
curl http://localhost:4000/health

# Test via domain (setelah DNS dikonfigurasi)
curl http://api-bibitku.filkom.ub.ac.id/health
curl http://api-bibitku.filkom.ub.ac.id/api/calculator/generate
curl http://api-bibitku.filkom.ub.ac.id/api/articles
```

### 8.2 Test dari Browser/Postman
Setelah DNS dikonfigurasi oleh admin:
- Health check: `http://api-bibitku.filkom.ub.ac.id/health`
- Calculator API: `http://api-bibitku.filkom.ub.ac.id/api/calculator/generate`
- Articles API: `http://api-bibitku.filkom.ub.ac.id/api/articles`

**Note**: Jika DNS belum dikonfig, test dulu dengan IP internal dari dalam VPS

### 8.3 Cek Logs
```bash
# PM2 logs
pm2 logs bibitku-be --lines 100

# Nginx access log
tail -f /var/log/nginx/bibitku_access.log

# Nginx error log
tail -f /var/log/nginx/bibitku_error.log
```

---

## 🔄 Langkah 9: Update/Redeploy di Kemudian Hari

Untuk update aplikasi di kemudian hari, gunakan script deploy:

```bash
# Jalankan deploy script
cd /var/www/bibitku-be
./deploy.sh
```

Atau manual:
```bash
cd /var/www/bibitku-be
git pull origin main
npm install --production
npx prisma generate
npx prisma migrate deploy
pm2 restart bibitku-be
```

---

## 📊 Monitoring & Maintenance

### Cek Status Aplikasi
```bash
# PM2 status
pm2 status

# Lihat logs realtime
pm2 logs bibitku-be

# Monitor CPU/Memory
pm2 monit
```

### Restart/Stop/Delete
```bash
# Restart
pm2 restart bibitku-be

# Stop
pm2 stop bibitku-be

# Delete dari PM2
pm2 delete bibitku-be

# Start lagi
pm2 start ecosystem.config.js
```

### Database Maintenance
```bash
# Backup database
pg_dump -h localhost -U petani kalkulator_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -h localhost -U petani kalkulator_db < backup_20250120.sql
```

---

## 🔒 Security Checklist

- ✅ .env file sudah di-gitignore
- ✅ .env file permission 600
- ✅ Database password secure
- ✅ CORS dikonfigurasi untuk domain spesifik
- ✅ Nginx security headers sudah ditambahkan
- ✅ PostgreSQL hanya listen di localhost
- ✅ Firewall (ufw) aktif

### Cek Security
```bash
# Cek file permissions
ls -la /var/www/bibitku-be/.env

# Cek firewall
sudo ufw status

# Cek PostgreSQL listening
sudo netstat -tulpn | grep postgres
```

---

## 🐛 Troubleshooting

### Backend tidak bisa diakses
```bash
# Cek PM2 status
pm2 status

# Cek logs error
pm2 logs bibitku-be --err --lines 50

# Restart aplikasi
pm2 restart bibitku-be
```

### Database connection error
```bash
# Cek PostgreSQL status
sudo systemctl status postgresql

# Test koneksi manual
psql -h localhost -U petani -d kalkulator_db

# Cek .env file
cat /var/www/bibitku-be/.env
```

### Nginx 502 Bad Gateway
```bash
# Cek backend running
curl http://localhost:4000/health

# Cek PM2 status
pm2 status

# Cek Nginx error log
tail -f /var/log/nginx/bibitku_error.log
```

### Port 4000 sudah digunakan
```bash
# Cek siapa yang pakai port 4000
sudo lsof -i :4000

# Kill process
sudo kill -9 <PID>

# Restart PM2
pm2 restart bibitku-be
```

---

## 📞 Contact

Jika ada masalah:
1. Cek logs: `pm2 logs bibitku-be`
2. Cek Nginx logs: `tail -f /var/log/nginx/bibitku_error.log`
3. Hubungi tim frontend atau admin VPS

---

## 📝 Catatan Penting

1. **Port**: Backend berjalan di port 4000, diproxy oleh Nginx
2. **Domain Backend**: http://api-bibitku.filkom.ub.ac.id (subdomain terpisah)
3. **Domain Frontend**: http://bibitku.filkom.ub.ac.id
4. **Database**: PostgreSQL di localhost:5432
5. **CORS**: Sudah dikonfigurasi untuk bibitku.filkom.ub.ac.id dan api-bibitku.filkom.ub.ac.id
6. **Auto-restart**: PM2 akan auto-restart jika backend crash
7. **Auto-start**: PM2 akan auto-start saat server reboot
8. **DNS**: Perlu koordinasi dengan admin untuk setup A Record api-bibitku.filkom.ub.ac.id

---

## ✅ Final Checklist

Sebelum melaporkan deployment selesai:

- [ ] Backend bisa diakses via `http://localhost:4000/health`
- [ ] DNS untuk `api-bibitku.filkom.ub.ac.id` sudah dikonfigurasi oleh admin
- [ ] Backend bisa diakses via `http://api-bibitku.filkom.ub.ac.id/health`
- [ ] API endpoint berfungsi: `http://api-bibitku.filkom.ub.ac.id/api/calculator/generate`
- [ ] Database migrations berhasil dijalankan
- [ ] Seed data berhasil dimasukkan
- [ ] PM2 status: online (running)
- [ ] PM2 logs tidak ada error kritis
- [ ] Nginx configuration valid (`nginx -t`)
- [ ] CORS berfungsi (frontend bisa fetch API dari bibitku.filkom.ub.ac.id)
- [ ] SSL/HTTPS (jika diperlukan) sudah dikonfigurasi

---

**Selamat! Backend kentangpas sudah berhasil dideploy! 🎉**
