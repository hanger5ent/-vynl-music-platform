import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPlatformFeePercent, setPlatformFeePercent, PLATFORM_FEE_PERCENT_MIN, PLATFORM_FEE_PERCENT_MAX } from '@/lib/settings'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const platformFeePercent = await getPlatformFeePercent()
  return NextResponse.json({ settings: { platformFeePercent } })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await req.json()
  const { platformFeePercent } = body as { platformFeePercent?: number }

  if (
    typeof platformFeePercent !== 'number' ||
    !Number.isInteger(platformFeePercent) ||
    platformFeePercent < PLATFORM_FEE_PERCENT_MIN ||
    platformFeePercent > PLATFORM_FEE_PERCENT_MAX
  ) {
    return NextResponse.json(
      { error: `platformFeePercent must be an integer between ${PLATFORM_FEE_PERCENT_MIN} and ${PLATFORM_FEE_PERCENT_MAX}` },
      { status: 400 }
    )
  }

  const updated = await setPlatformFeePercent(platformFeePercent, session.user.id)
  return NextResponse.json({ settings: { platformFeePercent: updated } })
}
