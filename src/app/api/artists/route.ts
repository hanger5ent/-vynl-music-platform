import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SORT_FIELDS = ['followers', 'streams', 'newest'] as const
type SortField = (typeof SORT_FIELDS)[number]

// Directory of creators. Follower counts and stream totals are computed
// live from Follow/Track rather than the (unpopulated) CreatorProfile
// rollup fields, since nothing in the app currently writes to those.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()
    const sortByParam = searchParams.get('sortBy')
    const sortBy: SortField = SORT_FIELDS.includes(sortByParam as SortField) ? (sortByParam as SortField) : 'followers'
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '24'), 1), 50)

    const creators = await prisma.user.findMany({
      where: {
        isCreator: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { username: { contains: q, mode: 'insensitive' } },
                { creatorProfile: { stageName: { contains: q, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        creatorProfile: { select: { stageName: true, genre: true, location: true } },
        _count: { select: { followers: true, tracks: true } },
      },
    })

    const streamTotals = await prisma.track.groupBy({
      by: ['ownerId'],
      where: { ownerId: { in: creators.map((c) => c.id) }, processingStatus: 'READY' },
      _sum: { playCount: true },
    })
    const streamsByOwner = new Map(streamTotals.map((s) => [s.ownerId, s._sum.playCount || 0]))

    const withTotals = creators.map((creator) => ({
      id: creator.id,
      name: creator.creatorProfile?.stageName || creator.name || creator.username,
      username: creator.username,
      avatar: creator.avatar,
      isVerified: creator.isVerified,
      genre: creator.creatorProfile?.genre || [],
      location: creator.creatorProfile?.location || null,
      followerCount: creator._count.followers,
      trackCount: creator._count.tracks,
      totalStreams: streamsByOwner.get(creator.id) || 0,
      createdAt: creator.createdAt,
    }))

    withTotals.sort((a, b) => {
      if (sortBy === 'streams') return b.totalStreams - a.totalStreams
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return b.followerCount - a.followerCount
    })

    const total = withTotals.length
    const paged = withTotals.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      artists: paged,
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
    console.error('Failed to fetch artists:', error)
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }
}
