import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Record a play/stream
// Note: purchase/subscription-gated playback is Sprint 2 scope and isn't
// wired up yet — every track is currently streamable once uploaded.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const trackId = params.id
    const body = await req.json().catch(() => ({}))
    const { duration } = body

    const track = await prisma.track.findUnique({ where: { id: trackId } })
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    const [updated] = await prisma.$transaction([
      prisma.track.update({
        where: { id: trackId },
        data: { playCount: { increment: 1 } },
      }),
      prisma.event.create({
        data: {
          type: 'track.played',
          userId: session?.user?.id || null,
          trackId,
          properties: {
            duration: duration || 0,
            userAgent: req.headers.get('user-agent') || 'unknown',
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      playCount: updated.playCount,
      message: 'Play recorded successfully'
    })

  } catch (error) {
    console.error('Failed to record play:', error)
    return NextResponse.json(
      { error: 'Failed to record play' },
      { status: 500 }
    )
  }
}
