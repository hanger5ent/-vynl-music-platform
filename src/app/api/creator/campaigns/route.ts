import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendCreatorCampaign } from '@/lib/resend-setup'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      subject, 
      content, 
      targetTiers = [], 
      subscriberIds = [],
      fromName 
    } = await request.json()

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // For now, we'll simulate getting subscribers since we need the Prisma client to be regenerated
    // In a real implementation, this would query the database
    const mockSubscribers = [
      {
        email: 'fan1@example.com',
        name: 'Music Fan 1',
        tier: 'BASIC'
      },
      {
        email: 'fan2@example.com', 
        name: 'Music Fan 2',
        tier: 'PREMIUM'
      }
    ]

    // Filter subscribers based on criteria
    let targetSubscribers = mockSubscribers

    if (targetTiers.length > 0) {
      targetSubscribers = targetSubscribers.filter(sub => 
        targetTiers.includes(sub.tier?.toUpperCase())
      )
    }

    if (subscriberIds.length > 0) {
      // In real implementation, filter by subscriber IDs
      console.log('Filtering by specific subscriber IDs:', subscriberIds)
    }

    // Send the campaign
    const result = await sendCreatorCampaign(
      session.user.email || '',
      session.user.name || 'Creator',
      targetSubscribers,
      {
        subject,
        content,
        fromName: fromName || session.user.name || 'Creator'
      }
    )

    // Log campaign for analytics (in real app, save to database)
    console.log('Campaign sent:', {
      creatorId: session.user.id,
      subject,
      recipientCount: result.total,
      sentCount: result.sent,
      failedCount: result.failed
    })

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${result.sent} subscribers`,
      stats: {
        total: result.total,
        sent: result.sent,
        failed: result.failed
      },
      campaignId: `campaign_${Date.now()}`, // In real app, would be from database
    })

  } catch (error) {
    console.error('Campaign send failed:', error)
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In real implementation, would fetch campaign history from database
    const mockCampaigns = [
      {
        id: 'campaign_1',
        subject: 'New Album Release! 🎵',
        sentAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        recipientCount: 150,
        openRate: 65.2,
        clickRate: 12.8
      },
      {
        id: 'campaign_2', 
        subject: 'Exclusive Behind-the-Scenes Content',
        sentAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        recipientCount: 89,
        openRate: 58.4,
        clickRate: 8.9
      }
    ]

    return NextResponse.json({
      campaigns: mockCampaigns,
      totalSent: mockCampaigns.reduce((sum, c) => sum + c.recipientCount, 0),
      averageOpenRate: mockCampaigns.reduce((sum, c) => sum + c.openRate, 0) / mockCampaigns.length,
      averageClickRate: mockCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / mockCampaigns.length,
    })

  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
