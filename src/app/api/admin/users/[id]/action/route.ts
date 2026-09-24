import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ACTIONS = [
  'suspend',
  'reactivate',
  'promote_creator',
  'demote_creator',
  'promote_admin',
  'demote_admin',
] as const
type Action = (typeof ACTIONS)[number]

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
  if (!ACTIONS.includes(action as Action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const targetUser = await prisma.user.findUnique({ where: { id: params.id } })
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (targetUser.id === session.user.id && (action === 'suspend' || action === 'demote_admin')) {
    return NextResponse.json({ error: "You can't do that to your own account" }, { status: 400 })
  }

  let updated
  switch (action as Action) {
    case 'suspend':
      updated = await prisma.user.update({
        where: { id: targetUser.id },
        data: { isSuspended: true, suspendedAt: new Date(), suspendedReason: reason?.trim() || null },
      })
      break
    case 'reactivate':
      updated = await prisma.user.update({
        where: { id: targetUser.id },
        data: { isSuspended: false, suspendedAt: null, suspendedReason: null },
      })
      break
    case 'promote_creator':
      updated = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({ where: { id: targetUser.id }, data: { isCreator: true } })
        await tx.creatorProfile.upsert({
          where: { userId: targetUser.id },
          update: {},
          create: { userId: targetUser.id, stageName: targetUser.name || targetUser.username },
        })
        return u
      })
      break
    case 'demote_creator':
      updated = await prisma.user.update({ where: { id: targetUser.id }, data: { isCreator: false } })
      break
    case 'promote_admin':
      updated = await prisma.user.update({ where: { id: targetUser.id }, data: { isAdmin: true } })
      break
    case 'demote_admin':
      updated = await prisma.user.update({ where: { id: targetUser.id }, data: { isAdmin: false } })
      break
  }

  return NextResponse.json({
    user: {
      id: updated.id,
      isCreator: updated.isCreator,
      isAdmin: updated.isAdmin,
      isSuspended: updated.isSuspended,
      suspendedReason: updated.suspendedReason,
    },
  })
}
