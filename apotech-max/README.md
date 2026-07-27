# Apotech Max

Aplikasi Apotech Max dibangun menggunakan **Next.js** untuk Frontend dan **ASP.NET Core (.NET / C#)** untuk Backend.

Berikut adalah panduan untuk orang awam agar bisa menjalankan project ini di komputer lokal.

## Persyaratan Awal (Prerequisites)

Sebelum menjalankan project, pastikan Anda sudah menginstal:
1. **Node.js** (Disarankan versi LTS terbaru, misalnya v18 atau v20)
2. **.NET SDK** (Pastikan sesuai dengan versi yang digunakan di project ini, misalnya .NET 8)
3. **Git** (Untuk clone repository jika belum ada)
4. **Database** (PostgreSQL) - diperlukan karena menggunakan Prisma sebagai ORM.

## Cara Menjalankan Aplikasi

### 1. Menjalankan Frontend (Next.js)

1. Buka terminal (Command Prompt / PowerShell / Terminal).
2. Arahkan ke folder frontend (biasanya di root project atau di folder `apotech-max`):
   ```bash
   cd apotech-max
   ```
3. Instal semua dependensi yang dibutuhkan:
   ```bash
   npm install
   ```
4. Copy file `.env.example` atau `.env` menjadi `.env.local` dan sesuaikan nilainya (seperti URL database):
   ```bash
   cp .env.example .env.local
   ```
5. Jalankan server untuk tahap development:
   ```bash
   npm run dev
   ```
6. Buka browser dan akses `http://localhost:3000`.

### 2. Menjalankan Backend (.NET / C#)

1. Buka terminal baru.
2. Arahkan ke folder backend API Anda.
3. Jalankan perintah untuk menjalankan server .NET:
   ```bash
   dotnet run
   ```
4. Backend API Anda akan berjalan biasanya di `http://localhost:5000` atau `https://localhost:5001`.

## Penjelasan `.env` dan `.env.local`

- **`.env`**: Biasanya berisi konfigurasi default yang aman untuk dibagikan. File ini seringkali ikut di-upload ke GitHub.
- **`.env.local`**: File ini khusus untuk pengaturan lokal di komputer Anda sendiri (misalnya password database pribadi, secret key). File ini **tidak boleh** di-upload ke GitHub demi keamanan. Next.js secara otomatis akan membaca `.env.local` dan menimpa nilai yang ada di `.env`.

## Catatan Tentang Prisma

Project ini menggunakan **Prisma** (`prisma`) sebagai ORM (Object-Relational Mapping) untuk berinteraksi dengan database (PostgreSQL). Jadi, Prisma **masih digunakan**. Jangan dihapus jika Anda tidak menggantinya dengan ORM atau query builder lain.

Untuk sinkronisasi database, biasanya diperlukan perintah:
```bash
npx prisma generate
npx prisma db push
```
