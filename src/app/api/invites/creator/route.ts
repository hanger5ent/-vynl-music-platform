import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { email, message } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_resend_api_key_here') {
      console.error('Resend API key not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Generate unique invite code
    const inviteCode = generateInviteCode()
    
    try {
      // TODO: Send invitation email when email service is configured
      console.log('Creator invite requested:', {
        to: email,
        from: session.user.email,
        inviteCode,
        message: message || 'Default invite message'
      })

      return NextResponse.json({ 
        success: true, 
        message: `Invitation would be sent to ${email}`,
        inviteCode
      })

    } catch (emailError) {
      console.error('Failed to send creator invite email:', emailError)
      return NextResponse.json({ 
        error: 'Failed to send invitation email. Please check your email configuration.' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Creator invite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method to retrieve invite status or list sent invites
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const inviteCode = searchParams.get('code')

    if (inviteCode) {
      // In a real implementation, you would check the database for this invite code
      return NextResponse.json({
        valid: true,
        code: inviteCode,
        message: 'Invite code is valid'
      })
    }

    // Return mock invite history for now
    return NextResponse.json({
      invites: [
        {
          id: '1',
          email: 'creator@example.com',
          inviterName: session.user.name,
          sentAt: new Date().toISOString(),
          status: 'sent',
          inviteCode: 'ABC12345'
        }
      ],
      total: 1
    })

  } catch (error) {
    console.error('Creator invite GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
