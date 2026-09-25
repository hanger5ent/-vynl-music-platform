import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailService } from '@/lib/email'

const SUPPORT_EMAIL = 'support@vynl.com'
const VALID_TYPES = ['contact', 'feedback'] as const

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  const body = await req.json()
  const { type, name, email, message } = body as Record<string, unknown>

  if (typeof type !== 'string' || !VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
  const senderEmail = typeof email === 'string' && email.trim() ? email.trim() : session?.user?.email
  if (!senderEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  if (typeof message !== 'string' || !message.trim() || message.length > 5000) {
    return NextResponse.json({ error: 'Message is required (max 5000 characters)' }, { status: 400 })
  }
  const senderName = typeof name === 'string' && name.trim() ? name.trim() : session?.user?.name || 'Anonymous'

  const subject = type === 'contact' ? `Contact form: ${senderName}` : `Feedback: ${senderName}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${type === 'contact' ? 'New contact form submission' : 'New feedback submission'}</h2>
      <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message.trim()}</p>
    </div>
  `

  const result = await emailService.sendEmail({
    to: SUPPORT_EMAIL,
    subject,
    html,
  })

  if (!result.success) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
