import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const BIO_MAX_LENGTH = 2000
const TEXT_MAX_LENGTH = 500

// A fan's own creator applications, most recent first, so the /creator/apply
// page can show "pending review" / "not approved, feel free to reapply"
// instead of always showing a blank form.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const applications = await prisma.creatorApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ applications })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.isCreator) {
    return NextResponse.json({ error: "You're already a creator" }, { status: 400 })
  }

  const existingPending = await prisma.creatorApplication.findFirst({
    where: { userId: session.user.id, status: 'PENDING' },
  })
  if (existingPending) {
    return NextResponse.json({ error: 'You already have an application under review' }, { status: 409 })
  }

  const body = await req.json()
  const {
    artistName,
    genre,
    bio,
    socialLinks,
    musicSamples,
    experienceLevel,
    goals,
    hasOriginalMusic,
    hasProfessionalRecordings,
  } = body as Record<string, unknown>

  if (typeof artistName !== 'string' || !artistName.trim() || artistName.length > 80) {
    return NextResponse.json({ error: 'Artist name is required (max 80 characters)' }, { status: 400 })
  }
  if (typeof genre !== 'string' || !genre.trim()) {
    return NextResponse.json({ error: 'Genre is required' }, { status: 400 })
  }
  if (typeof bio !== 'string' || !bio.trim() || bio.length > BIO_MAX_LENGTH) {
    return NextResponse.json({ error: `Bio is required (max ${BIO_MAX_LENGTH} characters)` }, { status: 400 })
  }
  if (typeof musicSamples !== 'string' || !musicSamples.trim() || musicSamples.length > TEXT_MAX_LENGTH) {
    return NextResponse.json({ error: `Music samples/portfolio links are required (max ${TEXT_MAX_LENGTH} characters)` }, { status: 400 })
  }
  if (typeof experienceLevel !== 'string' || !experienceLevel.trim()) {
    return NextResponse.json({ error: 'Experience level is required' }, { status: 400 })
  }
  if (hasOriginalMusic !== true || hasProfessionalRecordings !== true) {
    return NextResponse.json({ error: 'Please confirm both requirements' }, { status: 400 })
  }
  if (goals !== undefined && goals !== null && (typeof goals !== 'string' || goals.length > BIO_MAX_LENGTH)) {
    return NextResponse.json({ error: `Goals must be under ${BIO_MAX_LENGTH} characters` }, { status: 400 })
  }
  if (socialLinks !== undefined && socialLinks !== null && typeof socialLinks !== 'object') {
    return NextResponse.json({ error: 'Invalid social links' }, { status: 400 })
  }

  const application = await prisma.creatorApplication.create({
    data: {
      userId: session.user.id,
      artistName: artistName.trim(),
      genre: genre.trim(),
      bio: bio.trim(),
      socialLinks: socialLinks ?? undefined,
      musicSamples: musicSamples.trim(),
      experienceLevel: experienceLevel.trim(),
      goals: typeof goals === 'string' ? goals.trim() || null : null,
      hasOriginalMusic: true,
      hasProfessionalRecordings: true,
    },
  })

  return NextResponse.json({ application }, { status: 201 })
}
