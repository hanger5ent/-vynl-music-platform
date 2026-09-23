import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Summary stats for the signed-in creator's own shop.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sellerId = session.user.id

    const [totalProducts, activeOrders, revenueAgg, activeProducts] = await Promise.all([
      prisma.product.count({ where: { sellerId, isActive: true } }),
      prisma.order.count({
        where: {
          orderStatus: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
          items: { some: { product: { sellerId } } },
        },
      }),
      // Shop revenue nets to zero unless both the gross PRODUCT_PURCHASE and
      // its paired negative PLATFORM_FEE row are included — orderId is only
      // ever set on shop-purchase ledger entries, so this sum is exactly
      // "net revenue from the shop" without re-deriving the fee split here.
      prisma.revenueLedger.aggregate({
        where: { creatorId: sellerId, orderId: { not: null } },
        _sum: { amount: true },
      }),
      prisma.product.findMany({ where: { sellerId, isActive: true }, select: { price: true, stock: true } }),
    ])

    const inventoryValue = activeProducts.reduce((sum, p) => sum + Number(p.price) * p.stock, 0)

    return NextResponse.json({
      totalProducts,
      activeOrders,
      revenue: Number(revenueAgg._sum.amount || 0),
      inventoryValue,
    })

  } catch (error) {
    console.error('Failed to fetch shop stats:', error)
    return NextResponse.json({ error: 'Failed to fetch shop stats' }, { status: 500 })
  }
}
