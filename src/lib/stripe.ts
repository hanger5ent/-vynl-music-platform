import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe functionality will be disabled')
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
}) : null

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  payment_method_types: ['card'],
  mode: 'subscription' as const,
}

// Subscription tier configurations
export const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic Supporter',
    price: 499, // $4.99 in cents
    interval: 'month' as const,
    features: ['Exclusive content', 'Early releases', 'Direct messages'],
  },
  premium: {
    name: 'Premium Supporter',
    price: 999, // $9.99 in cents
    interval: 'month' as const,
    features: ['All Basic features', 'Behind the scenes', 'Monthly Q&A', 'Merchandise discounts'],
  },
  vip: {
    name: 'VIP Supporter',
    price: 1999, // $19.99 in cents
    interval: 'month' as const,
    features: ['All Premium features', 'One-on-one calls', 'Concert presales', 'Limited merch'],
  },
}

// Product purchase configurations
export const PRODUCT_TYPES = {
  merchandise: {
    mode: 'payment' as const,
    payment_method_types: ['card'],
  },
  digital: {
    mode: 'payment' as const,
    payment_method_types: ['card'],
  },
}

export interface StripeCustomerData {
  email: string
  name?: string
  metadata?: {
    userId: string
    userType: 'fan' | 'creator'
  }
}

export interface StripeSubscriptionData {
  customerId: string
  priceId: string
  artistId: string
  tier: keyof typeof SUBSCRIPTION_TIERS
  metadata?: Record<string, string>
}

export interface StripeProductData {
  customerId: string
  productId: string
  quantity: number
  metadata?: Record<string, string>
}
