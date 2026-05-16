// Plain ESM seed — no TypeScript, no ts-node issues
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Manually parse .env.local before importing PrismaClient
const envPath = resolve(__dirname, '../.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
  console.log('✅ Loaded .env.local')
} catch {
  console.log('⚠️  .env.local not found, using existing env vars')
}

// Now import PrismaClient (DATABASE_URL is already in process.env)
const { PrismaClient } = await import('@prisma/client')
const { PrismaPg } = await import('@prisma/adapter-pg')

// bcrypt-compatible hash using Node crypto (PBKDF2) — or use a simple approach
// Since we can't easily use bcryptjs in pure ESM without issues, we'll use a workaround:
// Import bcryptjs dynamically
const bcrypt = await import('bcryptjs')

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL ?? ''),
})

async function main() {
  console.log('\n🌱 Seeding database...\n')

  // Settings
  const passwordHash = await bcrypt.default.hash('admin123', 12)

  const settings = [
    { key: 'admin_username', value: 'admin' },
    { key: 'admin_password_hash', value: passwordHash },
    { key: 'cash_enabled', value: 'true' },
    { key: 'qris_enabled', value: 'true' },
    { key: 'qris_image_url', value: '' },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }
  console.log('✅ Settings seeded')
  console.log('   Login admin: username=admin, password=admin123\n')

  // Products
  const products = [
    { name: 'Bayam Hijau', description: 'Bayam segar pilihan, kaya zat besi', category: 'Sayuran', price: 3000, unit: 'ikat', stock: 20, tags: ['hijau', 'segar', 'lokal'] },
    { name: 'Kangkung', description: 'Kangkung segar siap masak', category: 'Sayuran', price: 2500, unit: 'ikat', stock: 15, tags: ['hijau', 'segar'] },
    { name: 'Wortel', description: 'Wortel manis segar dari petani lokal', category: 'Sayuran', price: 5000, unit: 'kg', stock: 10, tags: ['oranye', 'manis', 'lokal'] },
    { name: 'Tomat Merah', description: 'Tomat merah segar, cocok untuk masak', category: 'Sayuran', price: 8000, unit: 'kg', stock: 12, tags: ['merah', 'segar'] },
    { name: 'Bawang Merah', description: 'Bawang merah lokal berkualitas', category: 'Bumbu & Rempah', price: 25000, unit: 'kg', stock: 8, tags: ['merah', 'bumbu'] },
    { name: 'Bawang Putih', description: 'Bawang putih segar pilihan', category: 'Bumbu & Rempah', price: 30000, unit: 'kg', stock: 7, tags: ['putih', 'bumbu'] },
    { name: 'Cabai Merah', description: 'Cabai merah segar, pedas berkualitas', category: 'Bumbu & Rempah', price: 40000, unit: 'kg', stock: 5, tags: ['merah', 'pedas', 'bumbu'] },
    { name: 'Tahu Putih', description: 'Tahu putih segar buatan lokal', category: 'Olahan', price: 2000, unit: 'pcs', stock: 30, tags: ['putih', 'protein'] },
    { name: 'Tempe', description: 'Tempe segar kedelai pilihan', category: 'Olahan', price: 3000, unit: 'pcs', stock: 25, tags: ['protein', 'lokal'] },
    { name: 'Pakcoy', description: 'Pakcoy hijau segar, cocok untuk tumis', category: 'Sayuran', price: 4000, unit: 'ikat', stock: 0, tags: ['hijau', 'segar'] },
  ]

  let created = 0
  let skipped = 0
  for (const p of products) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } })
    if (!exists) {
      await prisma.product.create({ data: p })
      console.log(`  ✚ ${p.name}`)
      created++
    } else {
      console.log(`  ~ ${p.name} (sudah ada, skip)`)
      skipped++
    }
  }

  console.log(`\n✅ Products: ${created} dibuat, ${skipped} di-skip`)
  console.log('\n🎉 Seed selesai!\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
