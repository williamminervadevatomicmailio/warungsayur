// Load env sebelum import PrismaClient
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL ?? ''),
})

async function main() {
  console.log('🌱 Seeding database...')

  const passwordHash = await bcrypt.hash('admin123', 12)

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
  console.log('✅ Settings seeded (admin / admin123)')

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

  for (const p of products) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } })
    if (!exists) {
      await prisma.product.create({ data: p })
      console.log(`  + ${p.name}`)
    } else {
      console.log(`  ~ ${p.name} (skip)`)
    }
  }

  console.log('\n🎉 Seed selesai!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
