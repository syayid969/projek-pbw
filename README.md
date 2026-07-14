# Stock Barang API dan Database

## Struktur Project
- `index.html` - frontend web app sederhana
- `style.css` - styling aplikasi
- `script.js` - logika frontend dasar
- `server.js` - backend API Express + SQLite
- `package.json` - konfigurasi dependensi
- `stock.db` - database SQLite (akan dibuat otomatis)

## Setup
1. Buka terminal di folder `projek`
2. Jalankan `npm install`
3. Jalankan `npm start`

API akan berjalan di `http://localhost:3000`

## Endpoint
- `GET /api/ping`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/items?user_id={user_id}`
- `POST /api/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`

## Contoh JSON
### Register
{
  "name": "Budi",
  "email": "budi@contoh.com",
  "password": "password123"
}

### Login
{
  "email": "budi@contoh.com",
  "password": "password123"
}

### Tambah Item
{
  "user_id": 1,
  "sku": "SKU-001",
  "name": "Bolpoin",
  "category": "Alat Tulis",
  "qty": 10,
  "price": 5000
}
