import { NextRequest, NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe is not configured' 
      }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { artistId, tier, returnUrl } = body

    if (!artistId || !tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]

    // Create or get customer
    let customer
    try {
      const customers = await stripe.customers.list({
        email: session.user.email!,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: session.user.email!,
          name: session.user.name!,
          metadata: {
            userId: session.user.id || '',
            userType: 'fan',
          },
        })
      }
    } catch (error) {
      console.error('Error with customer:', error)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    // Create or get price
    let price
    try {
      const prices = await stripe.prices.list({
        lookup_keys: [`${tier}_${artistId}`],
        limit: 1,
      })

      if (prices.data.length > 0) {
        price = prices.data[0]
      } else {
        // Create product first
        const product = await stripe.products.create({
          name: `${tierConfig.name} - Artist ${artistId}`,
          description: `${tierConfig.name} subscription for artist ${artistId}`,
          metadata: {
            artistId,
            tier,
          },
        })

        // Create price
        price = await stripe.prices.create({
          unit_amount: tierConfig.price,
          currency: 'usd',
          recurring: {
            interval: tierConfig.interval,
          },
          product: product.id,
          lookup_key: `${tier}_${artistId}`,
          metadata: {
            artistId,
            tier,
          },
        })
      }
    } catch (error) {
      console.error('Error creating price:', error)
      return NextResponse.json({ error: 'Failed to create price' }, { status: 500 })
    }

    // Create checkout session
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${returnUrl || process.env.NEXTAUTH_URL}/fan?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl || process.env.NEXTAUTH_URL}/artist/${artistId}/subscribe?canceled=true`,
        metadata: {
          artistId,
          tier,
          userId: session.user.id || '',
        },
        subscription_data: {
          metadata: {
            artistId,
            tier,
            userId: session.user.id || '',
          },
        },
      })

      return NextResponse.json({ 
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id
      })

    } catch (error) {
      console.error('Error creating checkout session:', error)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
