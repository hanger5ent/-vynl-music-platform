import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RoyaltyHolderRole } from '@prisma/client'

interface RoyaltyReportRow {
  trackId: string
  title: string
  isrc: string | null
  rightsAttested: boolean
  rightsAttestedAt: Date | null
  playCount: number
  trackEarnings: number
  role: RoyaltyHolderRole | null
  holderName: string | null
  holderEmail: string | null
  percentage: number | null
}

function toCsvValue(value: string | number) {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

// PRO-report-ready royalty data for the signed-in creator: one row per
// (track, registered rights holder), with ISRC, play counts, and any
// track-level earnings recorded in the revenue ledger. This is a data
// export for feeding into ASCAP/BMI/SoundExchange filing workflows — it
// does not submit anything to a PRO directly (none expose a self-serve
// API for that).
//
// Earnings will read as 0 until Sprint 2's Stripe webhook is wired up to
// populate RevenueLedger; the query already joins through it so figures
// appear automatically once that's live.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!session.user.isCreator) {
      return NextResponse.json({ error: 'Only creators have a royalty report' }, { status: 403 })
    }

    const format = new URL(req.url).searchParams.get('format')

    const tracks = await prisma.track.findMany({
      where: { ownerId: session.user.id },
      include: {
        royaltySplits: true,
        purchases: {
          select: {
            amount: true,
            revenueLedgerEntries: { select: { amount: true, type: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const rows = tracks.flatMap((track): RoyaltyReportRow[] => {
      const trackEarnings = track.purchases
        .flatMap((p) => p.revenueLedgerEntries)
        .reduce((sum, entry) => sum + Number(entry.amount), 0)

      const base = {
        trackId: track.id,
        title: track.title,
        isrc: track.isrc,
        rightsAttested: track.rightsAttested,
        rightsAttestedAt: track.rightsAttestedAt,
        playCount: track.playCount,
        trackEarnings,
      }

      if (track.royaltySplits.length === 0) {
        return [{ ...base, role: null, holderName: null, holderEmail: null, percentage: null }]
      }

      return track.royaltySplits.map((split) => ({
        ...base,
        role: split.role,
        holderName: split.holderName,
        holderEmail: split.holderEmail,
        percentage: Number(split.percentage),
      }))
    })

    if (format === 'csv') {
      const header = ['Track', 'ISRC', 'Rights Attested', 'Play Count', 'Track Earnings', 'Role', 'Holder Name', 'Holder Email', 'Percentage']
      const lines = [header.join(',')]
      for (const row of rows) {
        lines.push([
          toCsvValue(row.title),
          toCsvValue(row.isrc || ''),
          toCsvValue(row.rightsAttested ? 'yes' : 'no'),
          toCsvValue(row.playCount),
          toCsvValue(row.trackEarnings.toFixed(2)),
          toCsvValue(row.role || ''),
          toCsvValue(row.holderName || ''),
          toCsvValue(row.holderEmail || ''),
          toCsvValue(row.percentage != null ? row.percentage.toFixed(2) : ''),
        ].join(','))
      }

      return new NextResponse(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="royalty-report.csv"',
        },
      })
    }

    return NextResponse.json({ tracks: rows })

  } catch (error) {
    console.error('Failed to build royalty report:', error)
    return NextResponse.json({ error: 'Failed to build royalty report' }, { status: 500 })
  }
}
