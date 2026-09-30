import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, username: true, avatar: true } },
      chapters: { orderBy: { chapterNumber: 'asc' } },
    },
  })

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  const isOwner = session?.user?.id === book.ownerId
  const purchased = book.isFree
    ? true
    : session?.user
      ? !!(await prisma.bookPurchase.findUnique({
          where: { bookId_buyerId: { bookId: book.id, buyerId: session.user.id } },
          select: { status: true },
        }).then((p) => p?.status === 'COMPLETED'))
      : false

  return NextResponse.json({
    book: {
      ...book,
      // Hide the download URL and unready chapters from anyone who hasn't
      // bought it (or isn't the owner) — this is the actual access gate,
      // not just a UI nicety.
      fileUrl: isOwner || purchased ? book.fileUrl : null,
      chapters: (isOwner || purchased
        ? book.chapters
        : book.chapters.filter((c) => c.processingStatus === 'READY')
      ).map((c) => (isOwner || purchased ? c : { ...c, audioUrl: null })),
      isOwner,
      purchased,
    },
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const book = await prisma.book.findUnique({ where: { id: params.id } })
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }
  if (book.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'You can only edit your own books' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, author, narrator, coverImage, genre, price, fileUrl, fileFormat } = body as Record<string, unknown>

  const updated = await prisma.book.update({
    where: { id: book.id },
    data: {
      ...(typeof title === 'string' && title.trim() ? { title: title.trim() } : {}),
      ...(typeof description === 'string' && description.trim() ? { description: description.trim() } : {}),
      ...(typeof author === 'string' && author.trim() ? { author: author.trim() } : {}),
      ...(narrator !== undefined ? { narrator: typeof narrator === 'string' && narrator.trim() ? narrator.trim() : null } : {}),
      ...(coverImage !== undefined ? { coverImage: typeof coverImage === 'string' && coverImage.trim() ? coverImage.trim() : null } : {}),
      ...(genre !== undefined ? { genre: typeof genre === 'string' && genre.trim() ? genre.trim() : null } : {}),
      ...(typeof price === 'number' && Number.isFinite(price) && price >= 0 ? { price, isFree: price <= 0 } : {}),
      ...(book.format === 'EBOOK' && typeof fileUrl === 'string' && fileUrl.trim() ? { fileUrl: fileUrl.trim() } : {}),
      ...(book.format === 'EBOOK' && (fileFormat === 'pdf' || fileFormat === 'epub') ? { fileFormat } : {}),
    },
  })

  return NextResponse.json({ book: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const book = await prisma.book.findUnique({ where: { id: params.id } })
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }
  if (book.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'You can only delete your own books' }, { status: 403 })
  }

  await prisma.book.delete({ where: { id: book.id } })
  return NextResponse.json({ success: true })
}
