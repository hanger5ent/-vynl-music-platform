import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, amount, subscriptionTier } = await request.json()

    if (!email || !customerName || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: email, customerName, amount' },
        { status: 400 }
      )
    }

    const result = await emailService.sendPaymentConfirmation(
      email,
      customerName,
      amount,
      'usd',
      subscriptionTier ? `${subscriptionTier} subscription` : 'One-time payment'
    )

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Payment confirmation email sent to ${email}`,
        amount: amount,
        subscriptionTier,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send payment confirmation email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Payment confirmation email test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
