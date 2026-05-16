import { prisma } from '@/lib/prisma'
import ProductList from '@/components/customer/ProductList'

export const dynamic = 'force-dynamic'

export default async function ProdukPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return <ProductList initialProducts={products} />
}
