import { loadStripe } from '@stripe/stripe-js'

// This is your Stripe publishable key (safe to use in client-side code)
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RldDl2fc8l8owUvEg4a0WGvIgOflwsDeY63gTO7lTsYbVeMih6l1WC1Wdg440IRdSKTuarfXnfpynHPyiBLA1lw00X8gQlXl4'

// Initialize Stripe.js
export const getStripe = () => {
  return loadStripe(stripePublishableKey)
}

// Client-side Stripe configuration
export const STRIPE_CLIENT_CONFIG = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#8b5cf6', // Purple theme matching your platform
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '8px',
    },
  },
  loader: 'auto' as const,
}

// Stripe Elements options
export const STRIPE_ELEMENTS_OPTIONS = {
  mode: 'payment' as const,
  currency: 'usd',
  appearance: STRIPE_CLIENT_CONFIG.appearance,
}

// Common Stripe checkout options
export const getCheckoutOptions = (mode: 'payment' | 'subscription' = 'payment') => ({
  mode,
  payment_method_types: ['card'],
  billing_address_collection: 'auto' as const,
  shipping_address_collection: mode === 'payment' ? {
    allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'IT', 'ES', 'NL']
  } : undefined,
  automatic_tax: {
    enabled: true,
  },
  customer_creation: 'always' as const,
})

// Helper function to redirect to Stripe Checkout
export const redirectToStripeCheckout = async (sessionId: string) => {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe failed to load')
  }
  
  const { error } = await stripe.redirectToCheckout({ sessionId })
  if (error) {
    throw new Error(error.message)
  }
}

// Helper function to format price for display
export const formatStripeAmount = (amount: number, currency = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Subscription tier display helpers
export const getSubscriptionDisplayInfo = (tier: 'basic' | 'premium' | 'vip') => {
  const configs = {
    basic: {
      color: 'blue',
      icon: '🎵',
      badge: '',
      popular: false,
    },
    premium: {
      color: 'purple', 
      icon: '⭐',
      badge: '',
      popular: false,
    },
    vip: {
      color: 'yellow',
      icon: '👑',
      badge: 'Most Popular',
      popular: true,
    }
  }
  
  return configs[tier]
}

// Test card numbers for development
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002', 
  REQUIRES_AUTH: '4000002500003155',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
  INCORRECT_CVC: '4000000000000127',
}

// Webhook event types we handle
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated', 
  'customer.subscription.deleted',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
] as const

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[number]
