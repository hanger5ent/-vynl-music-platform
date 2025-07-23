import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if Resend API key is configured
    const resendConfigured = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key_here'
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev'
    
    return NextResponse.json({
      resendConfigured,
      emailFrom,
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 8) + '...' : 'Not set',
      message: resendConfigured 
        ? 'Resend is properly configured' 
        : 'Resend API key needs to be set in .env.local'
    })

  } catch (error) {
    console.error('Resend config check failed:', error)
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    )
  }
}
