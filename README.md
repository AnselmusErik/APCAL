# APCAL — ANSI/ASQ Z1.4 Pharma Calculator

Aplikasi Kalkulator Sampling Plan dan Evaluasi Kualitas **ANSI/ASQ Z1.4** untuk Quality Assurance (QA) Produk Farmasi.

---

## 🏗️ Arsitektur Aplikasi

```text
Next.js (Frontend)
   │
   │ HTTP REST API (http://localhost:5075/api)
   ▼
ASP.NET Core Web API (Backend C#)
   │
   ▼
PostgreSQL Database (Entity Framework Core)
```

- **Frontend (`apotech-max/`)**: Next.js 16 (React 19 + TypeScript + Tailwind CSS v4)
- **Backend (`Apotech.Backend/`)**: ASP.NET Core Web API (.NET 10 / .NET 9)
- **Database**: PostgreSQL (Database name: `apotek_sample`)

---

## 🚀 Panduan Cara Menjalankan Aplikasi (Langkah demi Langkah)

### 📋 1. Prasyarat (Tools yang Perlu Diinstall)

Sebelum menjalankan aplikasi, pastikan komputer Anda telah terinstall:
1. **Node.js (v20 atau terbaru)**: [Download Node.js](https://nodejs.org)
2. **.NET SDK (v9 atau v10)**: [Download .NET SDK](https://dotnet.microsoft.com/download)
3. **PostgreSQL Database**: [Download PostgreSQL](https://www.postgresql.org/download/) (atau gunakan pgAdmin / Navicat)

---

### 📥 2. Clone Repository

Buka **Terminal** (macOS/Linux) atau **Command Prompt / PowerShell** (Windows), lalu jalankan:

```bash
git clone https://github.com/AnselmusErik/APCAL.git
cd APCAL
```

---

### 🗄️ 3. Persiapan Database PostgreSQL

1. Buat database baru di PostgreSQL dengan nama **`apotek_sample`**.
   - **Via Navicat / pgAdmin**: Klik kanan pada `Databases` → `Create Database...` → beri nama **`apotek_sample`**.
   - **Via Terminal**:
     ```bash
     createdb -U postgres apotek_sample
     ```

2. Jika perlu meng-import struktur tabel manual (tanpa EF Core CLI), Anda dapat meng-import file **`Apotech.Backend/schema.sql`** ke dalam database `apotek_sample`.

---

### ⚙️ 4. Menjalankan Backend (C# .NET Web API)

1. Buka Terminal dan masuk ke folder `Apotech.Backend`:
   ```bash
   cd Apotech.Backend
   ```

2. *(Opsional)* Jika username/password PostgreSQL komputer Anda tidak standar, buka `Program.cs` dan sesuaikan koneksi database:
   ```csharp
   "Host=localhost;Database=apotek_sample;Username=postgres;Password=password_anda"
   ```

3. Jalankan migration EF Core untuk membuat seluruh tabel otomatis:
   ```bash
   dotnet ef database update
   ```

4. Jalankan server Backend C#:
   ```bash
   dotnet run
   ```
   *(Backend akan aktif dan mendengarkan permintaan di `http://localhost:5075`)*

---

### 💻 5. Menjalankan Frontend (Next.js)

1. Buka **jendela Terminal baru** (biarkan backend C# tetap berjalan), lalu masuk ke folder `apotech-max`:
   ```bash
   cd apotech-max
   ```

2. Install paket pustaka frontend:
   ```bash
   npm install
   ```

3. Jalankan server dev Frontend:
   ```bash
   npm run dev
   ```
   *(File `.env` standar sudah disediakan otomatis di dalam folder `apotech-max`)*

---

### 🌐 6. Membuka Aplikasi

Buka web browser Anda (Chrome / Edge / Safari / Firefox) dan akses:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Fitur Utama Aplikasi

1. **Sampling Plan (Tab 1)**: Perhitungan jumlah sampel ($n$), kode huruf, dan titik sampling ATB berdasarkan ukuran lot dan level inspeksi (Normal / Tightened / Reduced).
2. **Input Cacat & Evaluasi (Tab 2)**: Evaluasi temuan cacat (Kritis, Mayor, Minor) dengan vonis otomatis **ACCEPT / REJECT** serta peringatan transisi *revert to Normal*.
3. **Riwayat Perhitungan (Tab 3)**: Pencatatan otomatis ke database PostgreSQL dengan filter pencarian real-time, status badge, dan fitur **Evaluasi Ulang**.
4. **Tabel Referensi (Tab 4)**: Tabel referensi lengkap ANSI/ASQ Z1.4 Table I (8 kolom level inspeksi) dan Master Tables II-A, II-B, II-C.
5. **Panduan (Tab 5)**: Panduan klasifikasi cacat produk injeksi steril farmasi dan aturan transisi switching rules.
