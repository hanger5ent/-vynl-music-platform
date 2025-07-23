import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createInviteSchema = z.object({
  email: z.string().email().optional(),
  type: z.enum(['ARTIST', 'CREATOR', 'ADMIN']).default('ARTIST'),
  expiresAt: z.string().datetime().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { email, type, expiresAt } = createInviteSchema.parse(body)

    // Generate unique invite code
    const code = generateInviteCode()

    // Set expiration (default 7 days)
    const expiration = expiresAt 
      ? new Date(expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        code,
        email,
        type,
        expiresAt: expiration,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        code: invite.code,
        email: invite.email,
        type: invite.type,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        creator: invite.creator,
      }
    })

  } catch (error) {
    console.error('Error creating invite:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
