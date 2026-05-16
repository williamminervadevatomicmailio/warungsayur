import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
}

/**
 * PUT /api/admin/products/[id]
 * Update product
 */
export async function PUT(
  request: NextRequest,
  context: { params: any }
) {
  try {
    await requireAdmin()

    const { id } = await context.params
    const body = await request.json()
    const { name, description, category, price, unit, stock, tags, imageUrl, isActive } = body

    const data: any = {}
    if (name !== undefined && name !== null && name !== '') data.name = name
    if (description !== undefined) data.description = description
    if (category !== undefined && category !== null && category !== '') data.category = category
    if (price !== undefined && price !== null) data.price = price
    if (unit !== undefined && unit !== null && unit !== '') data.unit = unit
    if (stock !== undefined && stock !== null) data.stock = stock
    if (tags !== undefined) {
      if (Array.isArray(tags)) data.tags = tags
      else if (typeof tags === 'string') data.tags = tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      else data.tags = []
    }
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (isActive !== undefined) data.isActive = isActive

    const product = await prisma.product.update({
      where: { id },
      data,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to update product:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete product
 */
export async function DELETE(
  request: NextRequest,
  context: { params: any }
) {
  try {
    await requireAdmin()

    const { id } = await context.params

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete product:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
