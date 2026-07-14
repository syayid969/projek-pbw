# Setup Stock Barang dengan XAMPP MySQL

## Langkah-langkah Setup:

### 1. Start XAMPP
- Buka XAMPP Control Panel
- Klik **Start** pada Apache (optional, hanya untuk PHP)
- Klik **Start** pada **MySQL**
- Tunggu sampai berwarna hijau (Running)

### 2. Create Database
- Buka browser: `http://localhost/phpmyadmin`
- Login (username: root, password: kosong)
- Di menu sebelah kiri, klik **New**
- Nama database: `stock_barang`
- Klik **Create**

### 3. Install Dependencies
Buka PowerShell/CMD, masuk ke folder project:
```powershell
cd "c:\Users\LENOVO\OneDrive\Documents\projek"
npm install
```

Tunggu sampai selesai. Akan install:
- express
- cors
- mysql2 (database driver)

### 4. Jalankan Server
```powershell
npm start
```

Server akan berjalan di: `http://localhost:3000`

Jika ada error, pastikan:
- ✅ MySQL XAMPP sudah running
- ✅ Database `stock_barang` sudah dibuat
- ✅ npm install sudah selesai

### 5. Akses Aplikasi
- Buka browser: `http://localhost:3000`
- Login dengan:
  - Email: `admin@admin.com`
  - Password: `admin123`

---

## Troubleshooting:

**Error: "connect ECONNREFUSED 127.0.0.1:3306"**
→ MySQL XAMPP tidak running. Buka XAMPP Control Panel dan start MySQL.

**Error: "Access denied for user 'root'@'localhost'"**
→ Password MySQL berbeda. Edit di `server.js` baris `password: ''` sesuaikan password XAMPP Anda.

**Error: "Unknown database 'stock_barang'"**
→ Database belum dibuat. Buka phpMyAdmin dan create database `stock_barang`.

---

## File yang berubah:
- `server.js` - Updated untuk MySQL (dari SQLite)
- `package.json` - Ditambah mysql2 dependency

## Backup data lama (SQLite):
- File lama: `stock.db` masih tersimpan
- Jika perlu migrate data lama, beri tahu saya!

