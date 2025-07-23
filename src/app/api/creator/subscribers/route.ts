import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const includeEmails = url.searchParams.get('includeEmails') === 'true'
    const tier = url.searchParams.get('tier')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Get creator's subscribers with filtering
    const whereClause: Record<string, unknown> = {
      creatorId: session.user.id,
      status: 'ACTIVE',
    }

    if (tier) {
      whereClause.tier = tier.toUpperCase()
    }

    const [subscribers, totalCount] = await Promise.all([
      prisma.creatorSubscription.findMany({
        where: whereClause,
        include: {
          subscriber: {
            select: {
              id: true,
              name: true,
              username: true,
              email: includeEmails,
              avatar: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.creatorSubscription.count({ where: whereClause })
    ])

    // Get summary stats
    const [tierStats, emailStats] = await Promise.all([
      prisma.creatorSubscription.groupBy({
        by: ['tier'],
        where: {
          creatorId: session.user.id,
          status: 'ACTIVE',
        },
        _count: true,
      }),
      prisma.creatorSubscription.aggregate({
        where: {
          creatorId: session.user.id,
          status: 'ACTIVE',
          emailConsent: true,
        },
        _count: true,
      })
    ])

    const formattedSubscribers = subscribers.map(sub => ({
      id: sub.id,
      subscriber: sub.subscriber,
      tier: sub.tier,
      emailConsent: sub.emailConsent,
      emailPreferences: sub.emailPreferences,
      startDate: sub.startDate,
      nextBilling: sub.nextBilling,
      amount: sub.amount,
      currency: sub.currency,
    }))

    return NextResponse.json({
      subscribers: formattedSubscribers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        total: totalCount,
        byTier: tierStats.reduce((acc: Record<string, number>, stat: { tier: string; _count: number }) => {
          acc[stat.tier.toLowerCase()] = stat._count
          return acc
        }, {}),
        emailConsentCount: emailStats._count,
      }
    })

  } catch (error) {
    console.error('Failed to fetch subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, subscriberIds, emailListId, message } = await request.json()

    switch (action) {
      case 'export_emails':
        return await exportSubscriberEmails(session.user.id, subscriberIds)
      
      case 'add_to_list':
        return await addSubscribersToList(session.user.id, subscriberIds, emailListId)
      
      case 'send_message':
        return await sendMessageToSubscribers(session.user.id, subscriberIds, message)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Subscriber action failed:', error)
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    )
  }
}

async function exportSubscriberEmails(creatorId: string, subscriberIds?: string[]) {
  const whereClause: Record<string, unknown> = {
    creatorId,
    status: 'ACTIVE',
    emailConsent: true,
  }

  if (subscriberIds && subscriberIds.length > 0) {
    whereClause.id = { in: subscriberIds }
  }

  const subscribers = await prisma.creatorSubscription.findMany({
    where: whereClause,
    include: {
      subscriber: {
        select: {
          email: true,
          name: true,
          username: true,
        }
      }
    }
  })

  const emailData = subscribers.map(sub => ({
    email: sub.subscriber.email,
    name: sub.subscriber.name || sub.subscriber.username,
    tier: sub.tier,
    subscriptionDate: sub.startDate.toISOString(),
    emailPreferences: sub.emailPreferences,
  }))

  return NextResponse.json({
    emails: emailData,
    count: emailData.length,
    exportedAt: new Date().toISOString(),
  })
}

async function addSubscribersToList(creatorId: string, subscriberIds: string[], emailListId: string) {
  // Verify the email list belongs to the creator
  const emailList = await prisma.creatorEmailList.findFirst({
    where: {
      id: emailListId,
      creatorId,
    }
  })

  if (!emailList) {
    return NextResponse.json({ error: 'Email list not found' }, { status: 404 })
  }

  // For now, we'll track this in the email preferences JSON field
  // In a full implementation, you might have a separate junction table
  await prisma.creatorSubscription.updateMany({
    where: {
      id: { in: subscriberIds },
      creatorId,
    },
    data: {
      emailPreferences: {
        // This would need more sophisticated JSON merging in a real app
        emailLists: [emailListId]
      }
    }
  })

  return NextResponse.json({
    success: true,
    message: `Added ${subscriberIds.length} subscribers to email list`,
  })
}

async function sendMessageToSubscribers(creatorId: string, subscriberIds: string[], message: { subject: string; content: string; type?: string }) {
  // This would integrate with your email service
  // For now, we'll just return a success message
  
  const subscribers = await prisma.creatorSubscription.findMany({
    where: {
      id: { in: subscriberIds },
      creatorId,
      emailConsent: true,
    },
    include: {
      subscriber: {
        select: {
          email: true,
          name: true,
        }
      }
    }
  })

  // Here you would send the actual emails using your email service
  // For now, we'll simulate it
  
  return NextResponse.json({
    success: true,
    message: `Message queued for ${subscribers.length} subscribers`,
    recipientCount: subscribers.length,
  })
}
