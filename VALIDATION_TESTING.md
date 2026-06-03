# 7.3 Validation Testing

Validation testing dilakukan pada seluruh kebutuhan fungsional sistem kalkulator bibit kentang Bibitku. Sistem Bibitku memiliki 6 kebutuhan fungsional yang diuji, yaitu 3 kebutuhan fungsional kalkulator kebutuhan bibit (G0, G2, G3) dan 3 kebutuhan fungsional kalkulator estimasi luas lahan (G0, G2, G3).

---

## 7.3.1 Validation Testing Lihat Estimasi Kebutuhan Bibit G0

Pengujian validasi lihat estimasi kebutuhan bibit G0 memiliki 2 kasus uji yaitu 1 kasus uji jalur utama dan 1 kasus uji jalur alternatif. Pengujian validasi dari kasus uji jalur utama dapat dilihat pada Tabel 7.1, sedangkan kasus uji jalur alternatif dapat dilihat pada Tabel 7.2.

**Tabel 7.1 Kasus Uji Lihat Estimasi Kebutuhan Bibit G0 Jalur Utama**

| Kode Kebutuhan | BK_F_01_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi kebutuhan bibit G0 jalur utama. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator kebutuhan bibit.<br>2. Memilih generasi bibit G0 dan memasukkan data lahan: panjang lahan 10 meter, lebar lahan 5 meter, lebar guludan 80 cm, lebar parit 20 cm, dan jarak tanam 25 cm.<br>3. Menekan tombol Hitung. |
| Hasil yang Diharapkan | Sistem menampilkan estimasi kebutuhan bibit G0 sebesar **205 biji**, jumlah guludan **5 baris**, dan total populasi tanaman **205 pohon**. |
| Hasil yang Didapatkan | Sistem menampilkan estimasi kebutuhan bibit G0 sebesar **205 biji**, jumlah guludan **5 baris**, dan total populasi tanaman **205 pohon**. |
| Status Validasi | Valid. |

**Tabel 7.2 Kasus Uji Lihat Estimasi Kebutuhan Bibit G0 Jalur Alternatif 4a**

| Kode Kebutuhan | BK_F_01_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi kebutuhan bibit G0 jalur alternatif 4a. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator kebutuhan bibit.<br>2. Memilih generasi bibit G2 dan memasukkan data lahan: lebar lahan 5 meter, lebar guludan 80 cm, lebar parit 20 cm, dan jarak tanam 25 cm. (tanpa memasukkan panjang lahan) |
| Hasil yang Diharapkan | Sistem menampilkan pesan "Panjang lahan wajib diisi." |
| Hasil yang Didapatkan | Sistem menampilkan pesan "Panjang lahan wajib diisi." |
| Status Validasi | Valid. |

---

## 7.3.2 Validation Testing Lihat Estimasi Kebutuhan Bibit G2

Pengujian validasi lihat estimasi kebutuhan bibit G2 memiliki 2 kasus uji yaitu 1 kasus uji jalur utama dan 1 kasus uji jalur alternatif. Pengujian validasi dari kasus uji jalur utama dapat dilihat pada Tabel 7.3, sedangkan kasus uji jalur alternatif dapat dilihat pada Tabel 7.4.

**Tabel 7.3 Kasus Uji Lihat Estimasi Kebutuhan Bibit G2 Jalur Utama**

| Kode Kebutuhan | BK_F_02_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi kebutuhan bibit G2 jalur utama. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator kebutuhan bibit.<br>2. Memilih generasi bibit G2 dan memasukkan data lahan: panjang lahan 10 meter, lebar lahan 5 meter, lebar guludan 80 cm, lebar parit 20 cm, dan jarak tanam 25 cm.<br>3. Menekan tombol Hitung. |
| Hasil yang Diharapkan | Sistem menampilkan estimasi kebutuhan bibit G2 sebesar **14 kg** (0,14 kuintal), jumlah guludan **5 baris**, dan total populasi tanaman **205 pohon**. |
| Hasil yang Didapatkan | Sistem menampilkan estimasi kebutuhan bibit G2 sebesar **14 kg** (0,14 kuintal), jumlah guludan **5 baris**, dan total populasi tanaman **205 pohon**. |
| Status Validasi | Valid. |

**Tabel 7.4 Kasus Uji Lihat Estimasi Kebutuhan Bibit G2 Jalur Alternatif 4a**

| Kode Kebutuhan | BK_F_02_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi kebutuhan bibit G2 jalur alternatif 4a. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator kebutuhan bibit.<br>2. Memilih generasi bibit G2 dan memasukkan data lahan: panjang lahan 10 meter, lebar guludan 80 cm, lebar parit 20 cm, dan jarak tanam 25 cm. (tanpa memasukkan lebar lahan) |
| Hasil yang Diharapkan | Sistem menampilkan pesan "Lebar lahan wajib diisi." |
| Hasil yang Didapatkan | Sistem menampilkan pesan "Lebar lahan wajib diisi." |
| Status Validasi | Valid. |

---

## 7.3.3 Validation Testing Lihat Estimasi Kebutuhan Bibit G3

Pengujian validasi lihat estimasi kebutuhan bibit G3 memiliki 2 kasus uji yaitu 1 kasus uji jalur utama dan 1 kasus uji jalur alternatif. Pengujian validasi dari kasus uji jalur utama dapat dilihat pada Tabel 7.5, sedangkan kasus uji jalur alternatif dapat dilihat pada Tabel 7.6.

**Tabel 7.5 Kasus Uji Lihat Estimasi Kebutuhan Bibit G3 Jalur Utama**

| Kode Kebutuhan | BK_F_03_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi kebutuhan bibit G3 jalur utama. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator kebutuhan bibit.<br>2. Memilih generasi bibit G3 dan memasukkan data lahan: panjang lahan 10 meter, lebar lahan 5 meter, lebar guludan 80 cm, lebar parit 20 cm, dan jarak tanam 25 cm.<br>3. Menekan tombol Hitung. |
| Hasil yang Diharapkan | Sistem menampilkan estimasi kebutuhan bibit G3 dalam rentang **12–18 kg** (estimasi 15 kg, 0,15 kuintal), jumlah guludan **5 baris**, dan total populasi tanaman **205 pohon**. |
| Hasil yang Didapatkan | Sistem menampilkan estimasi kebutuhan bibit G3 dalam rentang **12–18 kg** (estimasi 15 kg, 0,15 kuintal), jumlah guludan **5 baris**, dan total populasi tanaman **205 pohon**. |
| Status Validasi | Valid. |

**Tabel 7.6 Kasus Uji Lihat Estimasi Kebutuhan Bibit G3 Jalur Alternatif 4a**

| Kode Kebutuhan | BK_F_03_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi kebutuhan bibit G3 jalur alternatif 4a. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator kebutuhan bibit.<br>2. Memasukkan data lahan: panjang lahan 10 meter, lebar lahan 5 meter, lebar guludan 80 cm, lebar parit 20 cm, dan jarak tanam 25 cm, dengan generasi bibit "G4". |
| Hasil yang Diharapkan | Sistem menampilkan pesan "Generasi harus G0, G2, atau G3." |
| Hasil yang Didapatkan | Sistem menampilkan pesan "Generasi harus G0, G2, atau G3." |
| Status Validasi | Valid. |

---

## 7.3.4 Validation Testing Lihat Estimasi Luas Lahan G0

Pengujian validasi lihat estimasi luas lahan G0 memiliki 2 kasus uji yaitu 1 kasus uji jalur utama dan 1 kasus uji jalur alternatif. Pengujian validasi dari kasus uji jalur utama dapat dilihat pada Tabel 7.7, sedangkan kasus uji jalur alternatif dapat dilihat pada Tabel 7.8.

**Tabel 7.7 Kasus Uji Lihat Estimasi Luas Lahan G0 Jalur Utama**

| Kode Kebutuhan | BK_F_04_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi luas lahan G0 jalur utama. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator estimasi luas lahan.<br>2. Memilih generasi bibit G0 dan memasukkan data bibit: jumlah bibit 500 biji, jarak tanam 25 cm, lebar guludan 80 cm, dan lebar parit 20 cm.<br>3. Menekan tombol Hitung. |
| Hasil yang Diharapkan | Sistem menampilkan estimasi luas lahan sebesar **126,0 m²**, dengan **9 guludan** dan panjang lahan per guludan **14,0 meter**. |
| Hasil yang Didapatkan | Sistem menampilkan estimasi luas lahan sebesar **126,0 m²**, dengan **9 guludan** dan panjang lahan per guludan **14,0 meter**. |
| Status Validasi | Valid. |

**Tabel 7.8 Kasus Uji Lihat Estimasi Luas Lahan G0 Jalur Alternatif 4a**

| Kode Kebutuhan | BK_F_04_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi luas lahan G0 jalur alternatif 4a. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator estimasi luas lahan.<br>2. Memilih generasi bibit G0 dan memasukkan data bibit: jumlah bibit 500 biji, lebar guludan 80 cm, dan lebar parit 20 cm. (tanpa memasukkan jarak tanam) |
| Hasil yang Diharapkan | Sistem menampilkan pesan "Jarak tanam wajib diisi." |
| Hasil yang Didapatkan | Sistem menampilkan pesan "Jarak tanam wajib diisi." |
| Status Validasi | Valid. |

---

## 7.3.5 Validation Testing Lihat Estimasi Luas Lahan G2

Pengujian validasi lihat estimasi luas lahan G2 memiliki 2 kasus uji yaitu 1 kasus uji jalur utama dan 1 kasus uji jalur alternatif. Pengujian validasi dari kasus uji jalur utama dapat dilihat pada Tabel 7.9, sedangkan kasus uji jalur alternatif dapat dilihat pada Tabel 7.10.

**Tabel 7.9 Kasus Uji Lihat Estimasi Luas Lahan G2 Jalur Utama**

| Kode Kebutuhan | BK_F_05_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi luas lahan G2 jalur utama. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator estimasi luas lahan.<br>2. Memilih generasi bibit G2 dan memasukkan data bibit: berat bibit 100 kg, jarak tanam 25 cm, lebar guludan 80 cm, dan lebar parit 20 cm.<br>3. Menekan tombol Hitung. |
| Hasil yang Diharapkan | Sistem menampilkan estimasi luas lahan sebesar **376,0 m²**, dengan **16 guludan** dan panjang lahan per guludan **23,5 meter**. |
| Hasil yang Didapatkan | Sistem menampilkan estimasi luas lahan sebesar **376,0 m²**, dengan **16 guludan** dan panjang lahan per guludan **23,5 meter**. |
| Status Validasi | Valid. |

**Tabel 7.10 Kasus Uji Lihat Estimasi Luas Lahan G2 Jalur Alternatif 4a**

| Kode Kebutuhan | BK_F_05_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi luas lahan G2 jalur alternatif 4a. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator estimasi luas lahan.<br>2. Memilih generasi bibit G2 dan memasukkan data bibit: berat bibit 0 kg, jarak tanam 25 cm, lebar guludan 80 cm, dan lebar parit 20 cm. |
| Hasil yang Diharapkan | Sistem menampilkan pesan "Jumlah bibit harus angka > 0 (biji untuk G0, kg untuk G2/G3)." |
| Hasil yang Didapatkan | Sistem menampilkan pesan "Jumlah bibit harus angka > 0 (biji untuk G0, kg untuk G2/G3)." |
| Status Validasi | Valid. |

---

## 7.3.6 Validation Testing Lihat Estimasi Luas Lahan G3

Pengujian validasi lihat estimasi luas lahan G3 memiliki 2 kasus uji yaitu 1 kasus uji jalur utama dan 1 kasus uji jalur alternatif. Pengujian validasi dari kasus uji jalur utama dapat dilihat pada Tabel 7.11, sedangkan kasus uji jalur alternatif dapat dilihat pada Tabel 7.12.

**Tabel 7.11 Kasus Uji Lihat Estimasi Luas Lahan G3 Jalur Utama**

| Kode Kebutuhan | BK_F_06_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi luas lahan G3 jalur utama. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator estimasi luas lahan.<br>2. Memilih generasi bibit G3 dan memasukkan data bibit: berat bibit 200 kg, jarak tanam 25 cm, lebar guludan 80 cm, dan lebar parit 20 cm.<br>3. Menekan tombol Hitung. |
| Hasil yang Diharapkan | Sistem menampilkan estimasi luas lahan dalam rentang **600,0–900,0 m²**, dengan jumlah guludan **20–24 baris** dan panjang lahan per guludan **30,0–37,5 meter**. |
| Hasil yang Didapatkan | Sistem menampilkan estimasi luas lahan dalam rentang **600,0–900,0 m²**, dengan jumlah guludan **20–24 baris** dan panjang lahan per guludan **30,0–37,5 meter**. |
| Status Validasi | Valid. |

**Tabel 7.12 Kasus Uji Lihat Estimasi Luas Lahan G3 Jalur Alternatif 4a**

| Kode Kebutuhan | BK_F_06_00 |
|:---|:---|
| Nama Kasus Uji | Kasus uji lihat estimasi luas lahan G3 jalur alternatif 4a. |
| Prosedur Pengujian | 1. Berada di halaman kalkulator estimasi luas lahan.<br>2. Memilih generasi bibit G3 dan memasukkan data bibit: berat bibit 200 kg, jarak tanam 25 cm, dan lebar guludan 80 cm. (tanpa memasukkan lebar parit) |
| Hasil yang Diharapkan | Sistem menampilkan pesan "Lebar parit wajib diisi." |
| Hasil yang Didapatkan | Sistem menampilkan pesan "Lebar parit wajib diisi." |
| Status Validasi | Valid. |

---

## Ringkasan Hasil Validation Testing

| No | Kode Kebutuhan | Nama Use Case | Jumlah Kasus Uji | Status |
|----|---------------|---------------|-----------------|--------|
| 1 | BK_F_01_00 | Lihat Estimasi Kebutuhan Bibit G0 | 2 | Valid |
| 2 | BK_F_02_00 | Lihat Estimasi Kebutuhan Bibit G2 | 2 | Valid |
| 3 | BK_F_03_00 | Lihat Estimasi Kebutuhan Bibit G3 | 2 | Valid |
| 4 | BK_F_04_00 | Lihat Estimasi Luas Lahan G0 | 2 | Valid |
| 5 | BK_F_05_00 | Lihat Estimasi Luas Lahan G2 | 2 | Valid |
| 6 | BK_F_06_00 | Lihat Estimasi Luas Lahan G3 | 2 | Valid |
| | **Total** | | **12** | **Valid** |
