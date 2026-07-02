import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSplitSchema = z.object({
  role: z.enum(['SONGWRITER', 'PERFORMER', 'PRODUCER', 'PUBLISHER', 'OTHER']),
  percentage: z.number().positive().max(100),
  holderName: z.string().trim().min(1),
  holderEmail: z.string().trim().email().optional().or(z.literal('')),
  holderUsername: z.string().trim().optional(),
})

async function assertOwner(trackId: string, userId: string) {
  const track = await prisma.track.findUnique({ where: { id: trackId }, select: { ownerId: true } })
  if (!track) return { error: 'Track not found', status: 404 as const }
  if (track.ownerId !== userId) return { error: 'You can only manage royalty splits on your own tracks', status: 403 as const }
  return null
}

// List royalty splits for a track (owner only — includes contact emails)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ownerCheck = await assertOwner(params.id, session.user.id)
    if (ownerCheck) {
      return NextResponse.json({ error: ownerCheck.error }, { status: ownerCheck.status })
    }

    const splits = await prisma.royaltySplit.findMany({
      where: { trackId: params.id },
      include: { holderUser: { select: { id: true, name: true, username: true } } },
      orderBy: [{ role: 'asc' }, { percentage: 'desc' }],
    })

    return NextResponse.json({ splits })

  } catch (error) {
    console.error('Failed to fetch royalty splits:', error)
    return NextResponse.json({ error: 'Failed to fetch royalty splits' }, { status: 500 })
  }
}

// Register a royalty split for a track (owner only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ownerCheck = await assertOwner(params.id, session.user.id)
    if (ownerCheck) {
      return NextResponse.json({ error: ownerCheck.error }, { status: ownerCheck.status })
    }

    const body = await req.json()
    const data = createSplitSchema.parse(body)

    let holderUserId: string | null = null
    if (data.holderUsername) {
      const holderUser = await prisma.user.findUnique({ where: { username: data.holderUsername } })
      if (!holderUser) {
        return NextResponse.json({ error: 'No user found with that username' }, { status: 404 })
      }
      holderUserId = holderUser.id
    }

    const split = await prisma.$transaction(async (tx) => {
      const existing = await tx.royaltySplit.findMany({
        where: { trackId: params.id, role: data.role },
        select: { percentage: true },
      })
      const currentTotal = existing.reduce((sum, s) => sum + Number(s.percentage), 0)

      if (currentTotal + data.percentage > 100) {
        throw new Error(
          `${data.role} splits would total ${(currentTotal + data.percentage).toFixed(2)}%, exceeding 100%. ${(100 - currentTotal).toFixed(2)}% remaining.`
        )
      }

      return tx.royaltySplit.create({
        data: {
          trackId: params.id,
          role: data.role,
          percentage: data.percentage,
          holderName: data.holderName,
          holderEmail: data.holderEmail || null,
          holderUserId,
        },
        include: { holderUser: { select: { id: true, name: true, username: true } } },
      })
    })

    return NextResponse.json({ success: true, split }, { status: 201 })

  } catch (error) {
    console.error('Failed to create royalty split:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('exceeding 100%')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create royalty split' }, { status: 500 })
  }
}
