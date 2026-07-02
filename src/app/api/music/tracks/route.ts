import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const SORT_FIELDS: Record<string, string> = {
  title: 'title',
  playCount: 'playCount',
  likeCount: 'likeCount',
  createdAt: 'createdAt',
}

// Get all tracks with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')
    const ownerId = searchParams.get('ownerId')
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 50)
    const sortBy = SORT_FIELDS[searchParams.get('sortBy') || 'createdAt'] || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    const where: Prisma.TrackWhereInput = {
      ...(genre ? { genre: { equals: genre, mode: 'insensitive' } } : {}),
      ...(ownerId ? { ownerId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { owner: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    }

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, username: true, avatar: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.track.count({ where }),
    ])

    return NextResponse.json({
      tracks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    })

  } catch (error) {
    console.error('Failed to fetch tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    )
  }
}

// Create a track from an already-uploaded audio URL (metadata-only path).
// For uploading the audio file itself, see POST /api/music/upload.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isCreator) {
      return NextResponse.json({ error: 'Only creators can create tracks' }, { status: 403 })
    }

    const { title, description, genre, tags, price, audioUrl, duration, isrc, rightsAttestation } = await req.json()

    if (!title?.trim() || !audioUrl) {
      return NextResponse.json({
        error: 'Title and audio URL are required'
      }, { status: 400 })
    }

    if (!rightsAttestation) {
      return NextResponse.json({
        error: 'You must confirm you own or are licensed to distribute this recording.'
      }, { status: 400 })
    }

    if (isrc) {
      const existingIsrc = await prisma.track.findUnique({ where: { isrc } })
      if (existingIsrc) {
        return NextResponse.json({
          error: 'A track with this ISRC is already registered on the platform.'
        }, { status: 409 })
      }
    }

    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'track'
    let slug = baseSlug
    let suffix = 0
    while (await prisma.track.findUnique({ where: { slug } })) {
      suffix += 1
      slug = `${baseSlug}-${suffix}`
    }

    const track = await prisma.track.create({
      data: {
        title: title.trim(),
        slug,
        description: description || null,
        audioUrl,
        genre: genre || null,
        tags: Array.isArray(tags) ? tags : [],
        duration: duration || 0,
        price: price && price > 0 ? price : null,
        isFree: !price || price <= 0,
        ownerId: session.user.id,
        isrc: isrc || null,
        rightsAttested: true,
        rightsAttestedAt: new Date(),
      },
    })

    await prisma.event.create({
      data: { type: 'track.uploaded', userId: session.user.id, trackId: track.id },
    })

    return NextResponse.json({
      success: true,
      track,
      message: 'Track created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create track:', error)
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    )
  }
}
