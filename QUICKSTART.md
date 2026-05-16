# Warung Sayur Digital - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Setup Environment

```bash
# Copy environment example
cp .env.local.example .env.local

# Edit .env.local with your database URL and JWT secret
# Example for Supabase:
# DATABASE_URL="postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres"
```

### 2. Install & Initialize Database

```bash
# Install dependencies
npm install

# Create database schema and seed initial data
npm run db:push
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access the Application

- **Customer Portal**: http://localhost:3000/produk
- **Admin Panel**: http://localhost:3000/admin/login
- **Default Credentials**: 
  - Username: `admin`
  - Password: `admin123`

---

## 📋 Feature Checklist

### Customer Features ✅
- [x] Browse products by category
- [x] Search products in real-time
- [x] Add products to cart
- [x] Manage cart (increase/decrease quantity, remove items)
- [x] Checkout with customer info
- [x] Choose payment method (Cash/QRIS)
- [x] View order success with Transaction ID
- [x] Check order status using Transaction ID
- [x] Mobile-optimized responsive design
- [x] Elder-friendly UI (large fonts, clear buttons)

### Admin Features ✅
- [x] Secure login with JWT
- [x] Product management (CRUD)
- [x] Bulk stock management
- [x] Order management (view, update status, delete)
- [x] Payment method settings (enable/disable Cash/QRIS)
- [x] QRIS image management
- [x] Sales statistics dashboard
- [x] Daily/Weekly/Monthly reports

### API Endpoints ✅
- [x] GET /api/products
- [x] GET /api/products/search
- [x] POST /api/orders
- [x] GET /api/orders/[transactionId]
- [x] POST /api/admin/login
- [x] GET/POST/PUT/DELETE /api/admin/products
- [x] GET/PUT/DELETE /api/admin/orders
- [x] GET /api/admin/stats
- [x] GET/PUT /api/admin/settings

---

## 🗂️ Project Structure Overview

```
nextjs-warungsayur/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (customer)/         # Customer pages & layout
│   │   ├── admin/              # Admin pages & layout
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── customer/           # Customer UI components
│   │   └── admin/              # Admin UI components
│   ├── lib/
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── prisma.ts           # Prisma singleton
│   │   ├── utils.ts            # Helper functions
│   │   └── supabase.ts         # Supabase client
│   └── store/
│       └── cart.ts             # Cart state (Zustand)
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Database seeding script
│   └── migrations/             # Migration history
├── public/
│   └── images/                 # Static assets
├── .env.local.example          # Environment template
├── SETUP.md                    # Detailed setup guide
├── QUICKSTART.md               # This file
└── package.json                # Dependencies
```

---

## 🔧 Key Configuration

### Database Connection
Edit `.env.local`:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secret-key-change-this"
```

### Prisma Commands
```bash
# Push schema to database
npm run db:push

# Seed initial data (admin + sample products)
npm run db:seed

# Reset database (⚠️ deletes all data)
npm run db:reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

---

## 💡 Important Notes

### Security
1. **Change default admin password** immediately after first login
2. **Keep JWT_SECRET private** - don't commit to git
3. **Use HTTPS** in production
4. **Configure database** with strong password

### Stock Management
- Stock automatically decreases when order is created
- Admin can manually adjust stock in product management
- Out-of-stock products show "Habis" label but remain visible

### Payment Methods
- **Cash**: Customer pays at physical store
- **QRIS**: Static QR code uploaded by admin
  - Customer must show proof of payment to confirm order
  - Admin manually updates payment status

### Real-time Updates
- Currently uses 5-second polling for status updates
- Server-Sent Events (SSE) can replace polling in v1.1 for better efficiency

---

## 🐛 Common Issues & Solutions

### "Cannot find module 'next/font/google'"
```bash
npm install
npm run build
```

### "Prisma client not found"
```bash
npx prisma generate
```

### "Database connection error"
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Test connection with `npx prisma db push`

### Admin can't login
- Verify admin username/password in settings
- Check browser cookies are enabled
- Clear browser cache

### Images not loading
- Add image URL to product in admin panel
- Or upload to image hosting service
- Fallback uses placeholder image

---

## 📱 Testing the Application

### As a Customer
1. Go to `/produk`
2. Browse products or search by name
3. Add items to cart
4. Go to cart page
5. Click "Lanjut ke Checkout"
6. Fill customer info
7. Choose payment method
8. Click "Buat Pesanan"
9. Save Transaction ID
10. Go to `/cek-pesanan` to check status

### As Admin
1. Go to `/admin/login`
2. Login with `admin` / `admin123`
3. Manage products, orders, and settings

---

## 🚀 Production Deployment

### Vercel (Recommended)
```bash
vercel login
vercel
```

Configure these environment variables in Vercel dashboard:
- DATABASE_URL
- JWT_SECRET

### Database Migration
```bash
npm run db:push
npm run db:seed
```

### Health Check
- Customer page loads: `/produk`
- Can create order: POST `/api/orders`
- Admin can login: POST `/api/admin/login`
- Stats load: GET `/api/admin/stats`

---

## 📞 Support

Refer to [SETUP.md](./SETUP.md) for detailed documentation including:
- Database schema details
- All API endpoints
- Performance optimization
- Security checklist
- Troubleshooting guide

---

**Ready to go?** Start the dev server:
```bash
npm run dev
```

Visit: http://localhost:3000/produk
