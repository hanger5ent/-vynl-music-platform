import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Remove a registered royalty split (track owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; splitId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const track = await prisma.track.findUnique({ where: { id: params.id }, select: { ownerId: true } })
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }
    if (track.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'You can only manage royalty splits on your own tracks' }, { status: 403 })
    }

    const split = await prisma.royaltySplit.findUnique({ where: { id: params.splitId } })
    if (!split || split.trackId !== params.id) {
      return NextResponse.json({ error: 'Royalty split not found' }, { status: 404 })
    }

    await prisma.royaltySplit.delete({ where: { id: params.splitId } })

    return NextResponse.json({ success: true, message: 'Royalty split removed' })

  } catch (error) {
    console.error('Failed to delete royalty split:', error)
    return NextResponse.json({ error: 'Failed to delete royalty split' }, { status: 500 })
  }
}
