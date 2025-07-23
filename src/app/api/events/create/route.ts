import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date').optional(),
  location: z.string().optional(),
  venue: z.string().optional(),
  isOnline: z.boolean().default(false),
  price: z.number().nonnegative('Invalid price').optional(),
  isFree: z.boolean().default(false),
  maxTickets: z.number().int().positive('Invalid max tickets').optional(),
  coverImage: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createEventSchema.parse(body)

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location,
        venue: data.venue,
        isOnline: data.isOnline,
        price: data.price || null,
        isFree: data.isFree,
        maxTickets: data.maxTickets,
        coverImage: data.coverImage,
        organizerId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      event,
    })

  } catch (error) {
    console.error('Error creating event:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
