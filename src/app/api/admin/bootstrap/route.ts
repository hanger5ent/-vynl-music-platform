import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Browser-reachable equivalent of scripts/bootstrap-admin.js, for anyone
// deploying without a local terminal. Same one-time-only safety: refuses
// outright if any admin already exists, so it can never be used as a
// standing backdoor. Promotes whichever account is calling it (must be
// signed in already), not an arbitrary email, since there's no separate
// secret gating this beyond "no admin exists yet".
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'You need to be signed in first.' }, { status: 401 })
  }

  const adminCount = await prisma.user.count({ where: { isAdmin: true } })
  if (adminCount > 0) {
    return NextResponse.json(
      { error: 'An admin already exists. Ask them to send you an admin invite instead.' },
      { status: 400 }
    )
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { isAdmin: true } })
  return NextResponse.json({ success: true })
}
