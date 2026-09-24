import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CreatorApplicationStatus } from '@prisma/client'

const STATUS_VALUES: CreatorApplicationStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const statusParam = req.nextUrl.searchParams.get('status')?.toUpperCase()
  const status = STATUS_VALUES.includes(statusParam as CreatorApplicationStatus)
    ? (statusParam as CreatorApplicationStatus)
    : undefined

  const applications = await prisma.creatorApplication.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, name: true, username: true, email: true, avatar: true, createdAt: true } },
      reviewer: { select: { id: true, name: true, username: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ applications })
}
