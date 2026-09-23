import type { Prisma, RevenueLedgerEntryType } from '@prisma/client'
import { PLATFORM_FEE_PERCENT, splitGrossAmount } from '@/lib/stripe'

type TxClient = Prisma.TransactionClient

interface RecordEarningInput {
  creatorId: string
  type: RevenueLedgerEntryType
  grossAmount: number
  currency?: string
  purchaseId?: string
  subscriptionId?: string
  stripePaymentIntentId?: string
  stripeTransferId?: string
  description?: string
}

// Records a creator's gross earning plus the matching platform-fee entry,
// and rolls the net amount into CreatorProfile.totalRevenue (the cached
// figure creator dashboards display). The two ledger rows are the durable
// source of truth; totalRevenue is a denormalized read-optimization derived
// from them.
export async function recordCreatorEarning(tx: TxClient, input: RecordEarningInput) {
  const { creatorId, type, grossAmount, currency = 'usd', purchaseId, subscriptionId, stripePaymentIntentId, stripeTransferId, description } = input
  const { platformFee, netAmount } = splitGrossAmount(grossAmount)

  await tx.revenueLedger.create({
    data: {
      creatorId,
      type,
      amount: grossAmount,
      currency,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      purchaseId,
      subscriptionId,
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
  stripePaymentIntentId?: string
  description?: string
}

// Reverses a prior earning: negative REFUND ledger entry, and the creator's
// totalRevenue is brought back down by the net amount they'd been credited
// (gross minus the platform fee, which Stripe also returns to the payer).
export async function recordRefund(tx: TxClient, input: RecordRefundInput) {
  const { creatorId, amount, currency = 'usd', purchaseId, subscriptionId, stripePaymentIntentId, description } = input
  const { netAmount } = splitGrossAmount(amount)

  await tx.revenueLedger.create({
    data: {
      creatorId,
      type: 'REFUND',
      amount: -amount,
      currency,
      purchaseId,
      subscriptionId,
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
