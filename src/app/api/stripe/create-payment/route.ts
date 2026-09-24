import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlatformFeePercent } from '@/lib/settings'

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

    // A Checkout Session can only route funds to a single Connect
    // destination, so a cart mixing items from different artists can't be
    // paid out correctly in one session.
    const distinctArtistIds = new Set<string>(items.map((item) => item.artistId).filter(Boolean))

    if (distinctArtistIds.size > 1) {
      return NextResponse.json({
        error: 'All items in a single checkout must belong to the same artist.'
      }, { status: 400 })
    }

    let connectDestination: string | undefined
    if (distinctArtistIds.size === 1) {
      const [onlyArtistId] = distinctArtistIds
      const creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId: onlyArtistId } })
      if (creatorProfile?.stripeAccountId && creatorProfile.stripeChargesEnabled) {
        connectDestination = creatorProfile.stripeAccountId
      } else {
        // Nowhere for this seller's share to go — block rather than let the
        // platform account silently pocket 100% of a payment it can't pay out.
        return NextResponse.json({
          error: 'This artist hasn\'t finished setting up payouts yet, so they can\'t sell tracks, albums, or merchandise.'
        }, { status: 400 })
      }
    }

    // Best-effort stock check — not transactionally locked, so a race
    // between two concurrent checkouts for the last unit is still possible,
    // but this catches the common case of an already-sold-out item.
    const productItemIds = items.filter((item) => item.kind === 'product').map((item) => item.productId)
    if (productItemIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productItemIds } },
        select: { id: true, name: true, stock: true, isActive: true },
      })
      const productsById = new Map(products.map((p) => [p.id, p]))

      for (const item of items) {
        if (item.kind !== 'product') continue
        const product = productsById.get(item.productId)
        if (!product || !product.isActive) {
          return NextResponse.json({ error: `Product ${item.name || item.productId} is no longer available` }, { status: 400 })
        }
        if (product.stock < (item.quantity || 1)) {
          return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 })
        }
      }
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
    let totalCents = 0

    for (const item of items) {
      const { productId, quantity = 1, name, price, description, artistId, kind } = item
      const itemKind = kind === 'track' || kind === 'album' ? kind : 'product'
      totalCents += Math.round(price * 100) * quantity

      // Create or get price for this product
      let stripePrice
      try {
        const prices = await stripe.prices.list({
          lookup_keys: [`${itemKind}_${productId}`],
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
              kind: itemKind,
              refId: productId,
              artistId: artistId || '',
            },
          })

          // Create price
          stripePrice = await stripe.prices.create({
            unit_amount: Math.round(price * 100), // Convert to cents
            currency: 'usd',
            product: product.id,
            lookup_key: `${itemKind}_${productId}`,
            metadata: {
              kind: itemKind,
              refId: productId,
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

    const platformFeePercent = await getPlatformFeePercent()

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
        ...(connectDestination && {
          payment_intent_data: {
            application_fee_amount: Math.round(totalCents * (platformFeePercent / 100)),
            transfer_data: {
              destination: connectDestination,
            },
          },
        }),
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
