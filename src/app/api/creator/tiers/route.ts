import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getCreatorTiers,
  TIER_KEYS,
  TIER_NAME_MAX_LENGTH,
  TIER_FEATURE_MAX_LENGTH,
  TIER_MAX_FEATURES,
  TIER_MIN_PRICE_CENTS,
  TIER_MAX_PRICE_CENTS,
  type TierKey,
} from '@/lib/tiers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isCreator) {
    return NextResponse.json({ error: 'Only creators can manage tiers' }, { status: 403 })
  }

  const tiers = await getCreatorTiers(session.user.id)
  return NextResponse.json({ tiers })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isCreator) {
    return NextResponse.json({ error: 'Only creators can manage tiers' }, { status: 403 })
  }

  const body = await req.json()
  const { tier, name, price, features, isActive } = body as {
    tier?: string
    name?: string
    price?: number
    features?: unknown
    isActive?: boolean
  }

  if (!tier || !TIER_KEYS.includes(tier as TierKey)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const trimmedName = typeof name === 'string' ? name.trim() : ''
  if (!trimmedName || trimmedName.length > TIER_NAME_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Name must be 1-${TIER_NAME_MAX_LENGTH} characters` },
      { status: 400 }
    )
  }

  if (
    typeof price !== 'number' ||
    !Number.isInteger(price) ||
    price < TIER_MIN_PRICE_CENTS ||
    price > TIER_MAX_PRICE_CENTS
  ) {
    return NextResponse.json(
      { error: `Price must be an integer number of cents between ${TIER_MIN_PRICE_CENTS} and ${TIER_MAX_PRICE_CENTS}` },
      { status: 400 }
    )
  }

  if (!Array.isArray(features) || !features.every((f) => typeof f === 'string')) {
    return NextResponse.json({ error: 'Features must be an array of strings' }, { status: 400 })
  }
  const cleanedFeatures = features
    .map((f) => f.trim())
    .filter((f) => f.length > 0 && f.length <= TIER_FEATURE_MAX_LENGTH)
    .slice(0, TIER_MAX_FEATURES)
  if (cleanedFeatures.length === 0) {
    return NextResponse.json({ error: 'At least one feature is required' }, { status: 400 })
  }

  const config = await prisma.creatorTierConfig.upsert({
    where: { creatorId_tier: { creatorId: session.user.id, tier: tier.toUpperCase() as Uppercase<TierKey> } },
    create: {
      creatorId: session.user.id,
      tier: tier.toUpperCase() as Uppercase<TierKey>,
      name: trimmedName,
      price,
      features: cleanedFeatures,
      isActive: isActive ?? true,
    },
    update: {
      name: trimmedName,
      price,
      features: cleanedFeatures,
      isActive: isActive ?? true,
    },
  })

  return NextResponse.json({ tier: config })
}
