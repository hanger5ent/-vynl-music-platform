import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim()
  const filter = req.nextUrl.searchParams.get('filter') // 'takenDown' | undefined (all)
  const page = Math.max(parseInt(req.nextUrl.searchParams.get('page') || '1'), 1)
  const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get('limit') || '25'), 1), 100)

  const where = {
    ...(filter === 'takenDown' ? { isTakenDown: true } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { owner: { name: { contains: q, mode: 'insensitive' as const } } },
            { owner: { username: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  }

  const [tracks, total] = await Promise.all([
    prisma.track.findMany({
      where,
      select: {
        id: true,
        title: true,
        genre: true,
        playCount: true,
        likeCount: true,
        processingStatus: true,
        isTakenDown: true,
        takedownReason: true,
        takenDownAt: true,
        createdAt: true,
        owner: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.track.count({ where }),
  ])

  return NextResponse.json({
    tracks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
