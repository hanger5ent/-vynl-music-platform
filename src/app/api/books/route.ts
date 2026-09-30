import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { BookFormat, Prisma } from '@prisma/client'

const FORMATS: BookFormat[] = ['EBOOK', 'AUDIOBOOK']

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'book'
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title)
  let slug = base
  let suffix = 0
  while (suffix < 25) {
    const existing = await prisma.book.findUnique({ where: { slug } })
    if (!existing) return slug
    suffix += 1
    slug = `${base}-${suffix}`
  }
  return `${base}-${Date.now().toString(36)}`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const ownerId = req.nextUrl.searchParams.get('ownerId')
  const formatParam = req.nextUrl.searchParams.get('format')?.toUpperCase()
  const format = FORMATS.includes(formatParam as BookFormat) ? (formatParam as BookFormat) : undefined
  const search = req.nextUrl.searchParams.get('search')?.trim()

  const isOwnerViewingOwnCatalog = !!ownerId && session?.user?.id === ownerId

  const where: Prisma.BookWhereInput = {
    ...(ownerId ? { ownerId } : {}),
    ...(format ? { format } : {}),
    AND: [
      ...(search
        ? [{
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { author: { contains: search, mode: 'insensitive' as const } },
            ],
          }]
        : []),
      // Public browsing hides audiobooks with no playable chapters yet.
      // An owner viewing their own catalog sees everything regardless.
      ...(isOwnerViewingOwnCatalog
        ? []
        : [{ OR: [{ format: 'EBOOK' as const }, { chapters: { some: { processingStatus: 'READY' as const } } }] }]),
    ],
  }

  const books = await prisma.book.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, username: true, avatar: true } },
      _count: { select: { chapters: true, purchases: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ books })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isCreator) {
    return NextResponse.json({ error: 'Only creators can list books' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, author, narrator, coverImage, format, genre, price, fileUrl, fileFormat } = body as Record<string, unknown>

  if (typeof title !== 'string' || !title.trim() || title.length > 150) {
    return NextResponse.json({ error: 'Title is required (max 150 characters)' }, { status: 400 })
  }
  if (typeof description !== 'string' || !description.trim() || description.length > 3000) {
    return NextResponse.json({ error: 'Description is required (max 3000 characters)' }, { status: 400 })
  }
  if (typeof author !== 'string' || !author.trim() || author.length > 150) {
    return NextResponse.json({ error: 'Author is required (max 150 characters)' }, { status: 400 })
  }
  if (typeof format !== 'string' || !FORMATS.includes(format as BookFormat)) {
    return NextResponse.json({ error: 'Format must be EBOOK or AUDIOBOOK' }, { status: 400 })
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > 9999) {
    return NextResponse.json({ error: 'Price must be between 0 and 9999' }, { status: 400 })
  }

  if (format === 'EBOOK') {
    if (typeof fileUrl !== 'string' || !fileUrl.trim() || !/^https?:\/\//.test(fileUrl.trim())) {
      return NextResponse.json({ error: 'A valid download URL is required for an ebook' }, { status: 400 })
    }
    if (fileFormat !== 'pdf' && fileFormat !== 'epub') {
      return NextResponse.json({ error: 'fileFormat must be "pdf" or "epub"' }, { status: 400 })
    }
  }

  const slug = await generateUniqueSlug(title)

  const book = await prisma.book.create({
    data: {
      title: title.trim(),
      slug,
      description: description.trim(),
      author: author.trim(),
      narrator: format === 'AUDIOBOOK' && typeof narrator === 'string' && narrator.trim() ? narrator.trim() : null,
      coverImage: typeof coverImage === 'string' && coverImage.trim() ? coverImage.trim() : null,
      format: format as BookFormat,
      genre: typeof genre === 'string' && genre.trim() ? genre.trim() : null,
      price,
      isFree: price <= 0,
      ownerId: session.user.id,
      fileUrl: format === 'EBOOK' ? (fileUrl as string).trim() : null,
      fileFormat: format === 'EBOOK' ? (fileFormat as string) : null,
    },
  })

  return NextResponse.json({ book }, { status: 201 })
}
