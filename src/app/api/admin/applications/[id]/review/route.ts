import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

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
  const { action, note } = body as { action?: string; note?: string }
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 })
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > 1000)) {
    return NextResponse.json({ error: 'Note must be under 1000 characters' }, { status: 400 })
  }

  const application = await prisma.creatorApplication.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, email: true, isCreator: true } } },
  })
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }
  if (application.status !== 'PENDING') {
    return NextResponse.json({ error: 'This application has already been reviewed' }, { status: 400 })
  }

  const status = action === 'approve' ? 'APPROVED' : 'REJECTED'

  const updated = await prisma.$transaction(async (tx) => {
    const app = await tx.creatorApplication.update({
      where: { id: application.id },
      data: {
        status,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNote: note?.trim() || null,
      },
    })

    if (action === 'approve') {
      await tx.user.update({
        where: { id: application.userId },
        data: { isCreator: true, bio: application.bio },
      })
      await tx.creatorProfile.upsert({
        where: { userId: application.userId },
        update: {},
        create: {
          userId: application.userId,
          stageName: application.artistName,
          genre: [application.genre],
          socialLinks: application.socialLinks ?? undefined,
        },
      })
    }

    return app
  })

  // Best-effort notification - the review itself has already succeeded.
  try {
    if (action === 'approve') {
      await emailService.sendWelcomeEmail(application.user.email, application.user.name || 'there', 'creator')
    } else {
      await emailService.sendCreatorApplicationRejected(application.user.email, application.user.name || 'there', note)
    }
  } catch (error) {
    console.error('Failed to send application decision email:', error)
  }

  return NextResponse.json({ application: updated })
}
