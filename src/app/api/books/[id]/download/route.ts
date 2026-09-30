import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const book = await prisma.book.findUnique({ where: { id: params.id } })
  if (!book || book.format !== 'EBOOK' || !book.fileUrl) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  const isOwner = book.ownerId === session.user.id
  if (!isOwner && !book.isFree) {
    const purchase = await prisma.bookPurchase.findUnique({
      where: { bookId_buyerId: { bookId: book.id, buyerId: session.user.id } },
    })
    if (!purchase || purchase.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'You need to purchase this book first' }, { status: 403 })
    }
  }

  return NextResponse.json({ fileUrl: book.fileUrl, fileFormat: book.fileFormat })
}
