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
  const { action, note } = body as { action?: string; note?: string }
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 })
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > 1000)) {
    return NextResponse.json({ error: 'Note must be under 1000 characters' }, { status: 400 })
  }

  const request = await prisma.adRequest.findUnique({ where: { id: params.id } })
  if (!request) {
    return NextResponse.json({ error: 'Ad request not found' }, { status: 404 })
  }
  if (request.status !== 'PENDING') {
    return NextResponse.json({ error: 'This request has already been reviewed' }, { status: 400 })
  }

  const updated = await prisma.adRequest.update({
    where: { id: request.id },
    data: {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      reviewNote: note?.trim() || null,
    },
  })

  return NextResponse.json({ request: updated })
}
