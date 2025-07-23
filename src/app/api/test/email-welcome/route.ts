import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, userType } = await request.json()

    if (!email || !name || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, userType' },
        { status: 400 }
      )
    }

    const result = await emailService.sendWelcomeEmail(email, name, userType)

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Welcome email sent to ${email}`,
        userType,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Welcome email test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
