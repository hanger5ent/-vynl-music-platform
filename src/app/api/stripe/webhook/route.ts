import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // For now, just return success to allow deployment
    // This would normally handle Stripe webhooks
    console.log('Stripe webhook called')
    
    return NextResponse.json({ 
      received: true,
      message: 'Webhook endpoint active (not implemented yet)' 
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}
