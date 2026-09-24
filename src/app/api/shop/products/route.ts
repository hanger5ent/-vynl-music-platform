import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ProductCategory } from '@prisma/client'

// List shop products — the storefront a fan browses, either for one artist
// (?sellerId=) or across the whole platform, with optional search/category.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '24'), 1), 50)

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(sellerId ? { sellerId } : {}),
      ...(category && category in ProductCategory ? { category: category as ProductCategory } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true, name: true, description: true, price: true, stock: true,
          images: true, category: true, tags: true, createdAt: true,
          seller: { select: { id: true, name: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products: products.map((p) => ({ ...p, price: Number(p.price) })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })

  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
