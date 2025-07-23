import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
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
    const { items, returnUrl } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

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

    // Prepare line items
    const lineItems = []
    for (const item of items) {
      const { productId, quantity = 1, name, price, description, artistId } = item

      // Create or get price for this product
      let stripePrice
      try {
        const prices = await stripe.prices.list({
          lookup_keys: [`product_${productId}`],
          limit: 1,
        })

        if (prices.data.length > 0) {
          stripePrice = prices.data[0]
        } else {
          // Create product
          const product = await stripe.products.create({
            name: name || `Product ${productId}`,
            description: description || `Product from artist ${artistId}`,
            metadata: {
              productId,
              artistId: artistId || '',
            },
          })

          // Create price
          stripePrice = await stripe.prices.create({
            unit_amount: Math.round(price * 100), // Convert to cents
            currency: 'usd',
            product: product.id,
            lookup_key: `product_${productId}`,
            metadata: {
              productId,
              artistId: artistId || '',
            },
          })
        }

        lineItems.push({
          price: stripePrice.id,
          quantity,
        })

      } catch (error) {
        console.error(`Error creating price for product ${productId}:`, error)
        return NextResponse.json({ 
          error: `Failed to create price for product ${productId}` 
        }, { status: 500 })
      }
    }

    // Create checkout session
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${returnUrl || process.env.NEXTAUTH_URL}/fan?purchase_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl || process.env.NEXTAUTH_URL}/shop?canceled=true`,
        metadata: {
          userId: session.user.id || '',
          itemCount: items.length.toString(),
        },
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'], // Add more as needed
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
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
