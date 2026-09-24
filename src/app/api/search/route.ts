import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Search across the platform
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // all, tracks, artists, albums, playlists
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 50)

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        error: 'Search query is required'
      }, { status: 400 })
    }

    const validTypes = ['all', 'tracks', 'artists', 'albums', 'playlists']
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        error: 'Invalid search type'
      }, { status: 400 })
    }

    const q = query.trim()
    const wantsAll = type === 'all'

    const [tracks, artists, albums, playlists] = await Promise.all([
      wantsAll || type === 'tracks'
        ? prisma.track.findMany({
            where: {
              processingStatus: 'READY',
              isTakenDown: false,
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { genre: { contains: q, mode: 'insensitive' } },
                { owner: { name: { contains: q, mode: 'insensitive' } } },
              ],
            },
            select: {
              id: true, title: true, slug: true, duration: true, audioUrl: true,
              genre: true, playCount: true, likeCount: true,
              owner: { select: { id: true, name: true, username: true, avatar: true } },
            },
            orderBy: { playCount: 'desc' },
            take: limit,
          })
        : Promise.resolve([]),

      wantsAll || type === 'artists'
        ? prisma.user.findMany({
            where: {
              isCreator: true,
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { username: { contains: q, mode: 'insensitive' } },
                { bio: { contains: q, mode: 'insensitive' } },
                { creatorProfile: { stageName: { contains: q, mode: 'insensitive' } } },
              ],
            },
            select: {
              id: true, name: true, username: true, bio: true, avatar: true, isVerified: true,
              creatorProfile: { select: { genre: true } },
              _count: { select: { followers: true, tracks: true } },
            },
            take: limit,
          })
        : Promise.resolve([]),

      wantsAll || type === 'albums'
        ? prisma.album.findMany({
            where: {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true, title: true, slug: true, coverImage: true, releaseDate: true, price: true,
              owner: { select: { id: true, name: true, username: true } },
              _count: { select: { tracks: true } },
            },
            take: limit,
          })
        : Promise.resolve([]),

      // Curated/public playlists — a real query against the Playlist model,
      // which will simply return nothing until users start creating and
      // publishing them (no seed/editorial playlist content exists yet).
      wantsAll || type === 'playlists'
        ? prisma.playlist.findMany({
            where: {
              isPublic: true,
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true, title: true, description: true, coverImage: true, likeCount: true,
              owner: { select: { id: true, name: true, username: true } },
              _count: { select: { tracks: true } },
            },
            take: limit,
          })
        : Promise.resolve([]),
    ])

    let likedTrackIds = new Set<string>()
    if (session?.user && tracks.length > 0) {
      const likes = await prisma.like.findMany({
        where: { userId: session.user.id, trackId: { in: tracks.map((t) => t.id) } },
        select: { trackId: true },
      })
      likedTrackIds = new Set(likes.map((l) => l.trackId!))
    }

    const results: Record<string, unknown[]> = {}
    if (wantsAll || type === 'tracks') results.tracks = tracks.map((t) => ({ ...t, likedByMe: likedTrackIds.has(t.id) }))
    if (wantsAll || type === 'artists') {
      results.artists = artists.map((a) => ({
        id: a.id,
        name: a.name,
        username: a.username,
        bio: a.bio,
        avatar: a.avatar,
        isVerified: a.isVerified,
        genre: a.creatorProfile?.genre || [],
        followerCount: a._count.followers,
        trackCount: a._count.tracks,
      }))
    }
    if (wantsAll || type === 'albums') {
      results.albums = albums.map((a) => ({ ...a, price: a.price ? Number(a.price) : null, trackCount: a._count.tracks }))
    }
    if (wantsAll || type === 'playlists') {
      results.playlists = playlists.map((p) => ({ ...p, trackCount: p._count.tracks }))
    }

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

    return NextResponse.json({
      query,
      type,
      results,
      totalResults,
    })

  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
