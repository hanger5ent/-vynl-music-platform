import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PurchaseEntry {
  id: string
  type: 'track' | 'album' | 'merchandise' | 'book'
  title: string
  artist: string
  price: number
  purchaseDate: string
  status: string
  trackCount?: number
  audioUrl?: string | null
  bookId?: string
}

// The signed-in user's full purchase history — tracks/albums (Purchase),
// shop orders (Order), and books (BookPurchase), merged into one list.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [purchases, orders, bookPurchases] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          track: { select: { title: true, audioUrl: true, owner: { select: { name: true, username: true } } } },
          album: {
            select: {
              title: true,
              owner: { select: { name: true, username: true } },
              _count: { select: { tracks: true } },
            },
          },
        },
      }),
      prisma.order.findMany({
        where: { customerId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { name: true, seller: { select: { name: true, username: true } } } } } },
        },
      }),
      prisma.bookPurchase.findMany({
        where: { buyerId: session.user.id, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        include: { book: { select: { title: true, owner: { select: { name: true, username: true } } } } },
      }),
    ])

    const musicEntries: PurchaseEntry[] = purchases
      .filter((p) => p.track || p.album)
      .map((p) => {
        if (p.track) {
          return {
            id: p.id,
            type: 'track' as const,
            title: p.track.title,
            artist: p.track.owner.name || p.track.owner.username,
            price: Number(p.amount),
            purchaseDate: p.createdAt.toISOString(),
            status: p.status,
            audioUrl: p.track.audioUrl,
          }
        }
        return {
          id: p.id,
          type: 'album' as const,
          title: p.album!.title,
          artist: p.album!.owner.name || p.album!.owner.username,
          price: Number(p.amount),
          purchaseDate: p.createdAt.toISOString(),
          status: p.status,
          trackCount: p.album!._count.tracks,
        }
      })

    const merchEntries: PurchaseEntry[] = orders.map((order) => ({
      id: order.id,
      type: 'merchandise' as const,
      title: order.items.length === 1
        ? order.items[0].product.name
        : `${order.items.length} items`,
      artist: order.items[0]?.product.seller.name || order.items[0]?.product.seller.username || 'Unknown',
      price: Number(order.total),
      purchaseDate: order.createdAt.toISOString(),
      status: order.orderStatus,
    }))

    const bookEntries: PurchaseEntry[] = bookPurchases.map((p) => ({
      id: p.id,
      type: 'book' as const,
      title: p.book.title,
      artist: p.book.owner.name || p.book.owner.username,
      price: Number(p.price),
      purchaseDate: p.createdAt.toISOString(),
      status: p.status,
      bookId: p.bookId,
    }))

    const all = [...musicEntries, ...merchEntries, ...bookEntries].sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    )

    return NextResponse.json({
      purchases: all,
      totalSpent: all.reduce((sum, p) => sum + p.price, 0),
    })

  } catch (error) {
    console.error('Failed to fetch purchases:', error)
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
  }
}
