import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get user analytics (for artists and admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get('timeframe') || '30d' // 7d, 30d, 90d, 1y
    const userId = searchParams.get('userId') || session.user.id

    // Only allow artists to view their own analytics or admin to view all
    if (userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mock analytics data
    const mockAnalytics = {
      overview: {
        totalPlays: 125420,
        totalLikes: 3450,
        totalFollowers: 8420,
        totalRevenue: 2150.75,
        growthMetrics: {
          playsGrowth: 15.2,
          likesGrowth: 8.7,
          followersGrowth: 12.1,
          revenueGrowth: 22.5
        }
      },
      
      chartData: {
        plays: [
          { date: '2024-01-01', value: 1250 },
          { date: '2024-01-02', value: 1380 },
          { date: '2024-01-03', value: 1420 },
          { date: '2024-01-04', value: 1680 },
          { date: '2024-01-05', value: 1590 },
          { date: '2024-01-06', value: 1750 },
          { date: '2024-01-07', value: 1820 }
        ],
        revenue: [
          { date: '2024-01-01', value: 45.50 },
          { date: '2024-01-02', value: 52.30 },
          { date: '2024-01-03', value: 48.90 },
          { date: '2024-01-04', value: 67.20 },
          { date: '2024-01-05', value: 58.40 },
          { date: '2024-01-06', value: 72.10 },
          { date: '2024-01-07', value: 78.30 }
        ]
      },
      
      topTracks: [
        {
          id: '1',
          title: 'Summer Vibes',
          plays: 15420,
          likes: 342,
          revenue: 308.40,
          growth: 18.5
        },
        {
          id: '2',
          title: 'City Lights',
          plays: 9850,
          likes: 198,
          revenue: 197.00,
          growth: 12.3
        },
        {
          id: '3',
          title: 'Midnight Dreams',
          plays: 7240,
          likes: 156,
          revenue: 144.80,
          growth: -2.1
        }
      ],
      
      demographics: {
        countries: [
          { country: 'United States', plays: 45230, percentage: 36.1 },
          { country: 'United Kingdom', plays: 18750, percentage: 14.9 },
          { country: 'Canada', plays: 15420, percentage: 12.3 },
          { country: 'Australia', plays: 12340, percentage: 9.8 },
          { country: 'Germany', plays: 9870, percentage: 7.9 }
        ],
        ageGroups: [
          { range: '18-24', plays: 42150, percentage: 33.6 },
          { range: '25-34', plays: 38920, percentage: 31.0 },
          { range: '35-44', plays: 25480, percentage: 20.3 },
          { range: '45-54', plays: 12750, percentage: 10.2 },
          { range: '55+', plays: 6120, percentage: 4.9 }
        ]
      },
      
      timeframe,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      analytics: mockAnalytics
    })

  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
