import type { Prisma, RevenueLedgerEntryType } from '@prisma/client'
import { splitGrossAmount } from '@/lib/stripe'
import { getPlatformFeePercent } from '@/lib/settings'

type TxClient = Prisma.TransactionClient

interface RecordEarningInput {
  creatorId: string
  type: RevenueLedgerEntryType
  grossAmount: number
  currency?: string
  purchaseId?: string
  subscriptionId?: string
  orderId?: string
  stripePaymentIntentId?: string
  stripeTransferId?: string
  description?: string
}

// Records a creator's gross earning plus the matching platform-fee entry,
// and rolls the net amount into CreatorProfile.totalRevenue (the cached
// figure creator dashboards display). The two ledger rows are the durable
// source of truth; totalRevenue is a denormalized read-optimization derived
// from them. Uses the live admin-configurable platform fee (read inside the
// same transaction) and stores it on the entry so later refunds reverse the
// exact fee that applied at the time, even if the setting changes later.
export async function recordCreatorEarning(tx: TxClient, input: RecordEarningInput) {
  const { creatorId, type, grossAmount, currency = 'usd', purchaseId, subscriptionId, orderId, stripePaymentIntentId, stripeTransferId, description } = input
  const platformFeePercent = await getPlatformFeePercent(tx)
  const { platformFee, netAmount } = splitGrossAmount(grossAmount, platformFeePercent)

  await tx.revenueLedger.create({
    data: {
      creatorId,
      type,
      amount: grossAmount,
      currency,
      platformFeePercent,
      purchaseId,
      subscriptionId,
      orderId,
      stripePaymentIntentId,
      stripeTransferId,
      description,
    },
  })

  await tx.revenueLedger.create({
    data: {
      creatorId,
      type: 'PLATFORM_FEE',
      amount: -platformFee,
      currency,
      purchaseId,
      subscriptionId,
      orderId,
      stripePaymentIntentId,
      description: description ? `Platform fee on: ${description}` : 'Platform fee',
    },
  })

  await tx.creatorProfile.upsert({
    where: { userId: creatorId },
    update: { totalRevenue: { increment: netAmount } },
    create: { userId: creatorId, totalRevenue: netAmount },
  })

  return { grossAmount, platformFee, netAmount }
}

interface RecordRefundInput {
  creatorId: string
  amount: number
  currency?: string
  purchaseId?: string
  subscriptionId?: string
  orderId?: string
  stripePaymentIntentId?: string
  description?: string
  // The platformFeePercent stored on the original earning entry, so the
  // refund reverses the exact net amount credited even if the platform fee
  // has changed since. Falls back to the current live fee if not given.
  originalPlatformFeePercent?: number
}

// Reverses a prior earning: negative REFUND ledger entry, and the creator's
// totalRevenue is brought back down by the net amount they'd been credited
// (gross minus the platform fee, which Stripe also returns to the payer).
export async function recordRefund(tx: TxClient, input: RecordRefundInput) {
  const { creatorId, amount, currency = 'usd', purchaseId, subscriptionId, orderId, stripePaymentIntentId, description, originalPlatformFeePercent } = input
  const platformFeePercent = originalPlatformFeePercent ?? await getPlatformFeePercent(tx)
  const { netAmount } = splitGrossAmount(amount, platformFeePercent)

  await tx.revenueLedger.create({
    data: {
      creatorId,
      type: 'REFUND',
      amount: -amount,
      currency,
      purchaseId,
      subscriptionId,
      orderId,
      stripePaymentIntentId,
      description,
    },
  })

  await tx.creatorProfile.upsert({
    where: { userId: creatorId },
    update: { totalRevenue: { decrement: netAmount } },
    create: { userId: creatorId, totalRevenue: 0 },
  })
}

// Has a RevenueLedger entry already been recorded for this Stripe payment
// intent + type? Guards webhook handlers against Stripe's at-least-once
// delivery re-processing the same event twice.
export async function hasLedgerEntryForPaymentIntent(tx: TxClient, stripePaymentIntentId: string, type: RevenueLedgerEntryType) {
  const existing = await tx.revenueLedger.findFirst({
    where: { stripePaymentIntentId, type },
    select: { id: true },
  })
  return existing !== null
}
