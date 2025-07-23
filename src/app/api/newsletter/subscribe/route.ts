import { NextRequest, NextResponse } from 'next/server'
import { emailService, type NewsletterSubscription } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, preferences } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const subscription: NewsletterSubscription = {
      email,
      name,
      preferences: preferences || {
        artistUpdates: true,
        platformNews: true,
        promotions: true,
      },
      metadata: {
        subscribedAt: new Date().toISOString(),
        source: 'website',
      },
    }

    // Send confirmation email
    const success = await emailService.subscribeToNewsletter(subscription)

    if (!success) {
      return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 })
    }

    // Here you would typically save to your database
    // await saveNewsletterSubscription(subscription)

    console.log('Newsletter subscription:', email)

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET method to check subscription status (optional)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
  }

  // Here you would check your database for existing subscription
  // For now, return a placeholder response
  return NextResponse.json({ 
    subscribed: false, // Would be actual status from database
    preferences: {
      artistUpdates: true,
      platformNews: true,
      promotions: true,
    }
  })
}
