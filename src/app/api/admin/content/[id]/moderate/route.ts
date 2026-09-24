import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await req.json()
  const { action, reason } = body as { action?: string; reason?: string }
  if (action !== 'takedown' && action !== 'restore') {
    return NextResponse.json({ error: 'action must be "takedown" or "restore"' }, { status: 400 })
  }

  const track = await prisma.track.findUnique({ where: { id: params.id } })
  if (!track) {
    return NextResponse.json({ error: 'Track not found' }, { status: 404 })
  }

  const updated = await prisma.track.update({
    where: { id: track.id },
    data: action === 'takedown'
      ? { isTakenDown: true, takedownReason: reason?.trim() || null, takenDownAt: new Date() }
      : { isTakenDown: false, takedownReason: null, takenDownAt: null },
  })

  return NextResponse.json({
    track: { id: updated.id, isTakenDown: updated.isTakenDown, takedownReason: updated.takedownReason },
  })
}
