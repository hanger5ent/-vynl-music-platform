import { prisma } from '@/lib/prisma'
import { PLATFORM_FEE_PERCENT as DEFAULT_PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import type { Prisma } from '@prisma/client'

export { DEFAULT_PLATFORM_FEE_PERCENT }
export const PLATFORM_FEE_PERCENT_MIN = 0
export const PLATFORM_FEE_PERCENT_MAX = 50

const SETTINGS_ID = 'singleton'

// Reads the admin-configurable platform fee percent, falling back to the
// default if no settings row has been created yet. Accepts an optional
// transaction client so callers already inside a transaction (e.g. the
// Stripe webhook recording a ledger entry) read a consistent value.
export async function getPlatformFeePercent(client: Prisma.TransactionClient | typeof prisma = prisma): Promise<number> {
  const settings = await client.platformSettings.findUnique({ where: { id: SETTINGS_ID } })
  return settings?.platformFeePercent ?? DEFAULT_PLATFORM_FEE_PERCENT
}

export async function setPlatformFeePercent(percent: number, updatedBy: string): Promise<number> {
  const settings = await prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { platformFeePercent: percent, updatedBy },
    create: { id: SETTINGS_ID, platformFeePercent: percent, updatedBy },
  })
  return settings.platformFeePercent
}
