import { prisma } from '@/lib/prisma'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'

export type TierKey = keyof typeof SUBSCRIPTION_TIERS
export const TIER_KEYS = Object.keys(SUBSCRIPTION_TIERS) as TierKey[]

export interface ResolvedTier {
  id: TierKey
  name: string
  price: number // cents
  interval: string
  features: string[]
  isActive: boolean
  isCustomized: boolean
}

export const TIER_NAME_MAX_LENGTH = 60
export const TIER_FEATURE_MAX_LENGTH = 140
export const TIER_MAX_FEATURES = 10
export const TIER_MIN_PRICE_CENTS = 99
export const TIER_MAX_PRICE_CENTS = 99999

// Merges a creator's CreatorTierConfig overrides onto the platform's fixed
// tier defaults. A creator with no override row for a tier gets the default.
export async function getCreatorTiers(creatorId: string): Promise<ResolvedTier[]> {
  const overrides = await prisma.creatorTierConfig.findMany({ where: { creatorId } })
  const overrideByTier = new Map(overrides.map((o) => [o.tier, o]))

  return TIER_KEYS.map((key) => {
    const defaults = SUBSCRIPTION_TIERS[key]
    const override = overrideByTier.get(key.toUpperCase() as Uppercase<TierKey>)
    if (!override) {
      return {
        id: key,
        name: defaults.name,
        price: defaults.price,
        interval: defaults.interval,
        features: defaults.features,
        isActive: true,
        isCustomized: false,
      }
    }
    return {
      id: key,
      name: override.name,
      price: override.price,
      interval: defaults.interval,
      features: override.features,
      isActive: override.isActive,
      isCustomized: true,
    }
  })
}
