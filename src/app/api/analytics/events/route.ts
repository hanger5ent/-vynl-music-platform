import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Track user events for analytics — persists to the events log table
// (Sprint 1: "Event system fully wired to track lifecycle")
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const {
      event,
      trackId,
      properties = {},
      timestamp = Date.now()
    } = body

    if (!event) {
      return NextResponse.json({
        error: 'Event name is required'
      }, { status: 400 })
    }

    // Common event types: track.played, track.uploaded, like, follow, purchase, share, comment, etc.
    const created = await prisma.event.create({
      data: {
        type: event,
        userId: session?.user?.id || null,
        trackId: trackId || null,
        properties: {
          ...properties,
          userAgent: req.headers.get('user-agent'),
          ipAddress: req.ip || 'unknown',
          timestamp
        },
      }
    })

    return NextResponse.json({
      success: true,
      eventId: created.id,
      message: 'Event tracked successfully'
    })

  } catch (error) {
    console.error('Failed to track event:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
