import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Delete a comment — either the comment's own author, or the track's owner
// moderating their own track.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      select: { id: true, trackId: true, userId: true, track: { select: { ownerId: true } } },
    })

    if (!comment || comment.trackId !== params.id) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const isAuthor = comment.userId === session.user.id
    const isTrackOwner = comment.track?.ownerId === session.user.id
    if (!isAuthor && !isTrackOwner) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 })
    }

    await prisma.comment.delete({ where: { id: params.commentId } })

    return NextResponse.json({ success: true, message: 'Comment deleted' })

  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
