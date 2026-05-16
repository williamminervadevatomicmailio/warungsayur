# PRD — Sistem Penjualan Sayur Realtime
**Warung Sayur Digital | v1.0**
_Tanggal: Mei 2026 | Status: Draft for Review_

---

## 1. Executive Summary

### Problem Statement
Warung sayur fisik skala kecil kesulitan mengelola stok dan transaksi secara akurat — stok sering tidak sinkron, pencatatan manual rentan error, dan customer (terutama usia 40–60 tahun yang kurang familiar teknologi) tidak punya cara mudah untuk memesan sebelum datang ke toko.

### Proposed Solution
Sistem web-based point-of-sale dan storefront publik yang memungkinkan customer melihat produk, memesan, dan memilih metode bayar (Cash/QRIS), sementara admin dapat mengelola stok, produk, dan status pesanan secara realtime — semuanya dari satu platform.

### Success Criteria (KPIs)
| Metrik | Target |
|---|---|
| Waktu loading halaman produk | < 2 detik (LCP) |
| Waktu search realtime menampilkan hasil | < 300ms setelah user berhenti mengetik |
| Waktu admin update stok hingga tampil di user | < 3 detik (polling/SSE) |
| Error rate checkout | < 1% dari total transaksi |
| Transaction ID collision rate | 0% (harus 100% unik) |

---

## 2. User Experience & Functionality

### 2.1 User Personas

**Persona A — "Bu Sari" (End Customer)**
- Usia: 45–60 tahun, ibu rumah tangga
- Tech literacy: rendah, terbiasa WhatsApp dan marketplace sederhana
- Kebutuhan: UI yang besar, jelas, tidak membingungkan; bisa pesan sayur sebelum datang ke warung
- Device: Smartphone Android mid-range

**Persona B — "Pak Warung" (Admin/Pemilik)**
- Usia: 35–55 tahun, pemilik warung sayur fisik
- Tech literacy: menengah, familiar dengan aplikasi kasir sederhana
- Kebutuhan: Bisa update stok cepat, lihat pesanan masuk, konfirmasi pembayaran QRIS manual
- Device: HP atau tablet, kadang laptop

---

### 2.2 User Stories & Acceptance Criteria

#### 🛒 CUSTOMER FLOW

**Story 1 — Browse Produk**
> _Sebagai customer, saya ingin melihat semua produk yang tersedia berdasarkan kategori, agar saya bisa memilih sayuran yang ingin dibeli._

Acceptance Criteria:
- Produk ditampilkan dalam grid card dengan foto, nama, harga, satuan, dan sisa stok
- Tersedia filter kategori (tab/chip): Sayuran, Bumbu & Rempah, Olahan, Semua
- Card produk yang stok = 0 tetap tampil tapi dengan label "Habis" dan tombol non-aktif (disabled, abu-abu)
- Halaman di-render server-side (Next.js SSR/ISR) dan stok diperbarui via polling setiap 5 detik

**Story 2 — Search Realtime**
> _Sebagai customer, saya ingin mencari produk by nama atau warna/karakteristik, agar saya menemukan produk yang saya inginkan tanpa harus scroll panjang._

Acceptance Criteria:
- Search bar terletak di bagian atas, prominent, font besar minimum 16px
- Hasil muncul ≤ 300ms setelah user berhenti mengetik (debounce 300ms)
- Search menggunakan fuzzy matching terhadap: nama produk, kategori, dan field `warna_tag` (misal: "hijau" → bayam, pakcoy, bumbu desa kemasan hijau)
- Setiap produk memiliki field `tags` di database yang bisa diisi admin (misal: hijau, merah, segar, lokal)
- Jika tidak ada hasil, tampil ilustrasi kosong dengan teks "Produk tidak ditemukan 😔"

**Story 3 — Kelola Jumlah & Keranjang**
> _Sebagai customer, saya ingin menambah/kurangi jumlah produk dan memasukkannya ke keranjang, agar saya bisa mengatur pesanan sebelum checkout._

Acceptance Criteria:
- Tombol `+` dan `–` di setiap card produk, ukuran minimal 44x44px (touch-friendly)
- Angka jumlah tampil jelas di antara dua tombol, font bold minimum 18px
- Tombol `–` disabled ketika jumlah = 0 atau = 1 di keranjang
- Jika jumlah melebihi stok tersedia, tampil warning SweetAlert2: _"Stok [nama produk] hanya [X] [satuan], ya!"_ — user tetap bisa lanjut
- Keranjang disimpan di `localStorage` / React state (persist selama sesi)
- Icon keranjang di navbar menampilkan badge jumlah item aktif

**Story 4 — Halaman Keranjang**
> _Sebagai customer, saya ingin melihat semua item yang sudah saya pilih di halaman keranjang, agar saya bisa review sebelum bayar._

Acceptance Criteria:
- Menampilkan list item: foto thumbnail, nama, satuan, harga satuan, jumlah, subtotal
- Bisa edit jumlah atau hapus item langsung dari halaman keranjang
- Tampil total harga keseluruhan di bagian bawah (sticky footer)
- Tombol "Lanjut ke Checkout" harus prominent (full-width, warna hijau, font besar)

**Story 5 — Checkout**
> _Sebagai customer, saya ingin memasukkan nama dan nomor HP serta memilih metode bayar, agar pesanan saya bisa diproses oleh warung._

Acceptance Criteria:
- Form checkout: Nama (optional, placeholder "Opsional — boleh dikosongkan"), No. HP (mandatory, validasi format Indonesia: 08xx/62xx)
- Pilihan metode bayar: **Cash** atau **QRIS** — tampil sebagai card besar dengan ikon, bukan radio button kecil
- Jika pilih **QRIS**: setelah submit, tampil modal SweetAlert2 berisi gambar QRIS yang diupload admin + teks "Tunjukkan bukti transfer ke kasir untuk konfirmasi"
- Jika pilih **Cash**: langsung lanjut ke halaman order created
- Setelah checkout berhasil: tampil halaman sukses dengan Transaction ID yang besar dan jelas, disertai tombol "Salin ID" dan "Cek Status Pesanan"
- Transaction ID format: `SYR-YYYYMMDD-XXXXXX` (6 karakter random alphanumeric uppercase), dijamin unik di DB

**Story 6 — Cek Status Pesanan**
> _Sebagai customer, saya ingin mengecek status pesanan saya menggunakan Transaction ID, agar saya tahu apakah barang sudah disiapkan dan pembayaran sudah dikonfirmasi._

Acceptance Criteria:
- Tersedia halaman `/cek-pesanan` dengan input Transaction ID
- Tampil card status dengan 2 indikator terpisah:
  - **Status Pembayaran**: 🟡 Belum Bayar / 🟡 Menunggu Konfirmasi / 🟢 Lunas
  - **Status Barang**: 🟡 Sedang Disiapkan / 🟢 Siap Diambil
- Status badge menggunakan warna: kuning = pending, hijau = selesai
- Tampil juga: nama pemesan, list item, total harga, waktu order, metode bayar

---

#### 🔧 ADMIN FLOW

**Story 7 — Login Admin**
> _Sebagai admin, saya ingin login ke panel admin dengan kredensial, agar sistem aman dari akses tidak sah._

Acceptance Criteria:
- Halaman `/admin/login` dengan form username + password
- Session menggunakan JWT atau cookie HttpOnly, expire 8 jam
- Redirect ke `/admin` setelah login berhasil
- Maksimal 5 kali gagal login → lockout 15 menit (brute force protection)

**Story 8 — Manajemen Produk (CRUD)**
> _Sebagai admin, saya ingin menambah, mengubah, dan menghapus produk beserta stoknya, agar katalog selalu akurat._

Acceptance Criteria:
- Tabel produk dengan kolom: foto, nama, kategori, harga, satuan, stok, tags warna, status aktif
- Form tambah/edit produk: upload foto (max 2MB, format jpg/png/webp), nama, deskripsi, kategori, harga, satuan (input teks bebas: "kg", "ikat", "pcs", "bks", dll), stok awal, tags (comma-separated)
- Delete produk → SweetAlert2 konfirmasi: _"Yakin hapus [nama]? Produk yang terhapus tidak bisa dikembalikan."_
- Toggle aktif/nonaktif produk tanpa menghapus data
- Update stok bisa dilakukan langsung dari tabel (inline edit) tanpa harus masuk ke form edit

**Story 9 — Manajemen Metode Pembayaran**
> _Sebagai admin, saya ingin mengaktifkan/menonaktifkan metode pembayaran dan mengupload gambar QRIS, agar customer hanya bisa memilih metode yang tersedia._

Acceptance Criteria:
- Toggle on/off untuk Cash dan QRIS secara terpisah
- Upload gambar QRIS (statis): preview tampil sebelum save
- Jika QRIS dimatikan, pilihan QRIS tidak muncul di halaman checkout customer

**Story 10 — Manajemen Pesanan**
> _Sebagai admin, saya ingin melihat semua pesanan masuk, mengubah statusnya, dan menghapus pesanan jika diperlukan._

Acceptance Criteria:
- Tabel pesanan dengan kolom: Transaction ID, nama, HP, total, metode bayar, status bayar, status barang, waktu order
- Filter pesanan by: status pembayaran, status barang, tanggal
- Update status bayar: Belum Bayar → Lunas (atau sebaliknya)
- Update status barang: Sedang Disiapkan → Siap Diambil
- Hapus pesanan → SweetAlert2 konfirmasi dengan input ulang Transaction ID sebagai double-confirmation
- Semua perubahan status langsung tersimpan ke DB dan terefleksi di halaman cek pesanan customer (≤ 5 detik via polling)

**Story 11 — Statistik & Grafik**
> _Sebagai admin, saya ingin melihat statistik penjualan harian, mingguan, dan bulanan dalam bentuk angka dan grafik, agar saya bisa memantau performa warung._

Acceptance Criteria:
- Summary card: Total Pendapatan, Total Pesanan, Pesanan Lunas, Pesanan Pending — untuk periode hari ini / minggu ini / bulan ini
- Toggle periode: Harian | Mingguan | Bulanan
- Grafik line/bar: revenue per hari (untuk view harian & mingguan) atau per bulan (view bulanan)
- Grafik menggunakan library Recharts (kompatibel Next.js)
- Data grafik di-fetch dari API endpoint `/api/admin/stats?period=daily|weekly|monthly`

---

### 2.3 Non-Goals (Tidak Dibangun di v1.0)

- ❌ Sistem pengiriman / delivery ke alamat
- ❌ Notifikasi otomatis via WhatsApp / SMS / Email
- ❌ Multiple cabang / multi-toko
- ❌ Loyalty points / voucher / diskon
- ❌ QRIS dinamis per transaksi (payment gateway terintegrasi)
- ❌ Multi-role admin (kasir vs owner)
- ❌ Laporan ekspor ke Excel/PDF
- ❌ Mobile app native (Android/iOS)

---

## 3. Technical Specifications

### 3.1 Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| UI Library | SweetAlert2 (custom theme hijau), Animate.css |
| Font | Poppins (primary), + sub-font harmonis |
| Charting | Recharts |
| Backend | Next.js API Routes (serverless functions) |
| Database | PostgreSQL via Supabase (hosted, free tier) |
| ORM | Prisma |
| Auth | JWT + HttpOnly Cookie |
| File Upload | Supabase Storage (foto produk + QRIS) |
| Hosting | Vercel (frontend + API routes) |
| Realtime | Polling setiap 5 detik (SSE sebagai stretch goal v1.1) |

### 3.2 Database Schema (Simplified)

```sql
-- Products
products: id, name, description, category, price, unit, stock, tags, image_url (nullable → fallback ke foto template), is_active, created_at, updated_at

-- Orders
orders: id, transaction_id (UNIQUE), customer_name, customer_phone, payment_method, payment_status, item_status, total_price, created_at, updated_at

-- Order Items
order_items: id, order_id (FK), product_id (FK), product_name_snapshot, quantity, unit_snapshot, price_snapshot

-- Settings
settings: key (PK), value  
-- keys: qris_image_url, cash_enabled, qris_enabled, admin_username, admin_password_hash
```

**Foto Produk:**
- Jika admin belum upload foto → tampil foto template placeholder (gambar sayur default branded warung)
- Foto template disimpan di Supabase Storage sebagai asset statis
- Format yang diterima: jpg, png, webp — max 2MB per file

### 3.3 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/products` | List semua produk aktif |
| GET | `/api/products/search?q=hijau` | Search produk by nama/tags |
| POST | `/api/orders` | Buat pesanan baru |
| GET | `/api/orders/:transaction_id` | Cek status pesanan |
| POST | `/api/admin/login` | Login admin |
| GET | `/api/admin/products` | List semua produk (admin) |
| POST | `/api/admin/products` | Tambah produk |
| PUT | `/api/admin/products/:id` | Edit produk |
| DELETE | `/api/admin/products/:id` | Hapus produk |
| GET | `/api/admin/orders` | List semua pesanan |
| PUT | `/api/admin/orders/:id/status` | Update status pesanan |
| DELETE | `/api/admin/orders/:id` | Hapus pesanan |
| GET | `/api/admin/stats` | Statistik penjualan |
| GET/PUT | `/api/admin/settings` | Kelola setting (QRIS, payment methods) |

### 3.4 UI/UX Design Principles (Mobile-First + Elder-Friendly)

> ⚠️ **PRIORITAS UTAMA**: Mayoritas akses via smartphone. Semua desain harus mobile-first — desktop adalah secondary experience.

**Mobile-First:**
- Layout default dirancang untuk viewport 360–430px (smartphone Android umum)
- Bottom navigation bar untuk akses cepat: Produk | Keranjang | Cek Pesanan
- Tidak ada hover-dependent interaction — semua aksi via tap
- Infinite scroll untuk daftar produk (estimasi ~100 SKU) dengan skeleton loader saat fetch
- Sticky header dengan search bar agar selalu accessible saat scroll

**Elder-Friendly (target usia 40–60 tahun):**
- **Font size minimum**: Body 16px, label produk 18px, CTA button 20px
- **Touch target minimum**: 44x44px untuk semua tombol interaktif (WCAG 2.1 AA)
- **Kontras warna**: Rasio kontras teks ≥ 4.5:1
- **Warna dominan**: Putih (#FFFFFF) background, Hijau (#22C55E / green-500) primary
- **Ikon + Label**: Setiap tombol/aksi penting selalu punya ikon DAN teks, tidak ikon saja
- **Error message**: Bahasa Indonesia sehari-hari, tidak pakai jargon teknis
- **Konfirmasi sebelum aksi destruktif**: Semua via SweetAlert2

### 3.5 SweetAlert2 Custom Theme

```js
// Palet SweetAlert2 disesuaikan tema warung
const swalTheme = {
  confirmButtonColor: '#16a34a',  // green-600
  cancelButtonColor: '#6b7280',   // gray-500
  iconColor: '#22c55e',           // green-500
  fontFamily: 'Poppins, sans-serif',
}
```

### 3.6 Security & Privacy

- Password admin di-hash dengan bcrypt (salt rounds: 12)
- JWT disimpan di HttpOnly Cookie (tidak accessible JavaScript)
- Input form di-sanitize server-side untuk mencegah SQL Injection (Prisma parameterized queries)
- No. HP customer disimpan plaintext di DB (bukan data sensitif finansial), hanya digunakan untuk keperluan komunikasi toko
- File upload: validasi tipe MIME + ukuran di server sebelum disimpan
- Rate limiting pada endpoint login: max 5 request/15 menit per IP

---

## 4. Risks & Roadmap

### 4.1 Phased Rollout

**MVP (v1.0) — Target: ASAP**
- ✅ Halaman publik: browse produk, search, keranjang, checkout
- ✅ Halaman cek pesanan by Transaction ID
- ✅ Panel admin: CRUD produk, manajemen pesanan, setting QRIS
- ✅ Statistik dasar (harian/mingguan/bulanan)
- ✅ Polling realtime 5 detik

**v1.1 — 1-2 bulan setelah launch**
- 🔲 Server-Sent Events (SSE) menggantikan polling untuk update lebih efisien
- 🔲 Export laporan pesanan ke CSV
- 🔲 Foto produk dengan lazy loading + skeleton loader
- 🔲 PWA (Progressive Web App) agar bisa "install" di HP

**v2.0 — Masa depan**
- 🔲 Notifikasi WhatsApp otomatis via WA Business API / Fonnte
- 🔲 QRIS dinamis via payment gateway (Midtrans/Xendit)
- 🔲 Multi-role admin
- 🔲 Fitur promo & diskon

### 4.2 Technical Risks

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Stok race condition (2 user beli barang terakhir bersamaan) | Stok minus | Gunakan DB transaction + row-level locking saat UPDATE stok; tampilkan warning tapi tetap allow checkout |
| Hosting gratis punya cold start (Vercel serverless) | Respons lambat request pertama | Warmup ping, atau gunakan edge runtime Next.js |
| Gambar QRIS bocor ke publik via URL langsung | Minor — QRIS statis memang publik | Acceptable; QRIS statis tidak bisa dicegah sepenuhnya |
| Admin lupa password, tidak ada reset password | Lockout total | Seed script untuk reset admin via CLI/DB langsung |
| MySQL gratis (PlanetScale/Turso) ada limit koneksi | Error di jam ramai | Connection pooling via Prisma, monitor usage |

---

## 5. Resolved Questions

| # | Pertanyaan | Jawaban |
|---|---|---|
| OQ-1 | Hosting & DB | **Vercel** (frontend + API) + **Supabase** (PostgreSQL + Storage) |
| OQ-2 | Foto produk wajib? | **Wajib ada tampilan foto** — jika admin belum upload, gunakan foto template placeholder |
| OQ-3 | Estimasi jumlah produk | **~100 SKU** — gunakan **infinite scroll** dengan skeleton loader |
| OQ-4 | Admin credentials default | Username: `admin` / Password: `admin123` — bisa diubah via panel admin |

---

_PRD ini adalah living document. Setiap perubahan scope harus didiskusikan dan di-update di sini sebelum implementasi._
