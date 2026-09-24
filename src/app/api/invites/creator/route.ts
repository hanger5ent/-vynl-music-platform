import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateUniqueInviteCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateInviteCode()
    const existing = await prisma.invite.findUnique({ where: { code }, select: { id: true } })
    if (!existing) return code
  }
  throw new Error('Could not generate a unique invite code')
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

    const existingPending = await prisma.invite.findFirst({
      where: { email, createdBy: session.user.id, usedBy: null, isActive: true },
    })
    if (existingPending) {
      return NextResponse.json({
        error: 'You already have a pending invite out to this email address'
      }, { status: 409 })
    }

    const code = await generateUniqueInviteCode()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const invite = await prisma.invite.create({
      data: {
        code,
        email,
        type: 'CREATOR',
        expiresAt,
        createdBy: session.user.id,
      },
    })

    const sent = await emailService.sendCreatorInvite({
      email,
      inviterName: session.user.name || 'A Vynl creator',
      inviterEmail: session.user.email || '',
      message: message || undefined,
      inviteCode: code,
    })

    if (!sent) {
      // The invite is real and usable even if the email didn't go out —
      // don't discard it, since the code can still be shared manually.
      console.error(`Creator invite email to ${email} failed to send (invite ${invite.id} still created)`)
    }

    return NextResponse.json({
      success: true,
      message: sent ? `Invitation sent to ${email}` : `Invite created, but the email to ${email} failed to send — share the code directly`,
      inviteCode: code,
      emailSent: sent,
    }, { status: 201 })

  } catch (error) {
    console.error('Creator invite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// List invites this user has sent, or check one code's status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const inviteCode = searchParams.get('code')

    if (inviteCode) {
      const invite = await prisma.invite.findUnique({ where: { code: inviteCode } })
      if (!invite) {
        return NextResponse.json({ valid: false, message: 'Invite code not found' }, { status: 404 })
      }
      const valid = invite.isActive && !invite.usedBy && (!invite.expiresAt || invite.expiresAt > new Date())
      return NextResponse.json({
        valid,
        code: invite.code,
        message: !invite.isActive ? 'Invite has been deactivated'
          : invite.usedBy ? 'Invite has already been used'
          : invite.expiresAt && invite.expiresAt <= new Date() ? 'Invite has expired'
          : 'Invite code is valid',
      })
    }

    const invites = await prisma.invite.findMany({
      where: { createdBy: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, code: true, createdAt: true, usedAt: true, expiresAt: true, isActive: true },
    })

    return NextResponse.json({
      invites: invites.map((i) => ({
        id: i.id,
        email: i.email,
        inviteCode: i.code,
        sentAt: i.createdAt,
        status: i.usedAt ? 'accepted' : (i.expiresAt && i.expiresAt <= new Date()) || !i.isActive ? 'expired' : 'sent',
      })),
      total: invites.length,
    })

  } catch (error) {
    console.error('Creator invite GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
