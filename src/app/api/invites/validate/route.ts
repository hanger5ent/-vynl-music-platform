import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const validateInviteSchema = z.object({
  code: z.string().min(1, 'Invite code is required'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code } = validateInviteSchema.parse(body)

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { code },
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

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 })
    }

    // Check if invite is still active
    if (!invite.isActive) {
      return NextResponse.json({ error: 'This invite has been deactivated' }, { status: 400 })
    }

    // Check if invite has expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This invite has expired' }, { status: 400 })
    }

    // Check if invite has already been used
    if (invite.usedBy) {
      return NextResponse.json({ error: 'This invite has already been used' }, { status: 400 })
    }

    // Check if invite is email-specific
    if (invite.email && invite.email !== session.user.email) {
      return NextResponse.json({ 
        error: 'This invite is only valid for the specified email address' 
      }, { status: 400 })
    }

    // Use the invite and update user role
    await prisma.$transaction(async (tx) => {
      // Mark invite as used
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          usedBy: session.user.id,
          usedAt: new Date(),
        }
      })

      // Update user based on invite type
      const updateData: Record<string, unknown> = {}
      
      if (invite.type === 'ARTIST' || invite.type === 'CREATOR') {
        updateData.isArtist = true
        
        // Create artist profile if it doesn't exist
        await tx.artistProfile.upsert({
          where: { userId: session.user.id },
          update: {},
          create: {
            userId: session.user.id,
            stageName: session.user.name || session.user.email?.split('@')[0] || 'Unknown Artist',
          }
        })
      }
      
      if (invite.type === 'ADMIN') {
        updateData.isAdmin = true
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: updateData
      })
    })

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${invite.type.toLowerCase()} account`,
      invite: {
        type: invite.type,
        creator: invite.creator,
        usedAt: new Date(),
      }
    })

  } catch (error) {
    console.error('Error validating invite:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
