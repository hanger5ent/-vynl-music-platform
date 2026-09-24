import { NextResponse } from 'next/server'
import { getCreatorTiers } from '@/lib/tiers'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const tiers = await getCreatorTiers(params.id)
  return NextResponse.json({ tiers: tiers.filter((t) => t.isActive) })
}
