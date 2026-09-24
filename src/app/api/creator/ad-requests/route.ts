import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { AdRequestType } from '@prisma/client'

const AD_TYPES: AdRequestType[] = ['BANNER', 'SPONSORED_POST', 'VIDEO', 'AUDIO_SPOT']
const MIN_BUDGET = 10
const MAX_BUDGET = 50000

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requests = await prisma.adRequest.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ requests })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isCreator) {
    return NextResponse.json({ error: 'Only creators can request ads' }, { status: 403 })
  }

  const body = await req.json()
  const { adType, title, description, budget, targetAudience, preferredStartDate } = body as Record<string, unknown>

  if (typeof adType !== 'string' || !AD_TYPES.includes(adType as AdRequestType)) {
    return NextResponse.json({ error: 'Invalid ad type' }, { status: 400 })
  }
  if (typeof title !== 'string' || !title.trim() || title.length > 120) {
    return NextResponse.json({ error: 'Title is required (max 120 characters)' }, { status: 400 })
  }
  if (typeof description !== 'string' || !description.trim() || description.length > 1000) {
    return NextResponse.json({ error: 'Description is required (max 1000 characters)' }, { status: 400 })
  }
  if (typeof budget !== 'number' || !Number.isFinite(budget) || budget < MIN_BUDGET || budget > MAX_BUDGET) {
    return NextResponse.json({ error: `Budget must be between $${MIN_BUDGET} and $${MAX_BUDGET}` }, { status: 400 })
  }
  if (typeof targetAudience !== 'string' || !targetAudience.trim() || targetAudience.length > 300) {
    return NextResponse.json({ error: 'Target audience is required (max 300 characters)' }, { status: 400 })
  }
  const startDate = typeof preferredStartDate === 'string' ? new Date(preferredStartDate) : null
  if (!startDate || Number.isNaN(startDate.getTime()) || startDate.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: 'Preferred start date must be a valid, non-past date' }, { status: 400 })
  }

  const request = await prisma.adRequest.create({
    data: {
      creatorId: session.user.id,
      adType: adType as AdRequestType,
      title: title.trim(),
      description: description.trim(),
      budget,
      targetAudience: targetAudience.trim(),
      preferredStartDate: startDate,
    },
  })

  return NextResponse.json({ request }, { status: 201 })
}
