import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audioStorage } from '@/lib/storage'

const ALLOWED_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-flac']
const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'track'
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title)
  let slug = base
  let suffix = 0

  while (suffix < 25) {
    const existing = await prisma.track.findUnique({ where: { slug } })
    if (!existing) return slug
    suffix += 1
    slug = `${base}-${suffix}`
  }

  return `${base}-${Date.now().toString(36)}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isCreator) {
      return NextResponse.json({ error: 'Only creators can upload music' }, { status: 403 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const genre = formData.get('genre') as string | null
    const tags = JSON.parse((formData.get('tags') as string) || '[]')
    const price = formData.get('price') as string | null

    if (!audioFile || !title?.trim()) {
      return NextResponse.json({
        error: 'Audio file and title are required'
      }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(audioFile.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only MP3, WAV, and FLAC files are allowed.'
      }, { status: 400 })
    }

    if (audioFile.size > MAX_SIZE_BYTES) {
      return NextResponse.json({
        error: 'File is too large. Maximum size is 50MB.'
      }, { status: 400 })
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const stored = await audioStorage.saveAudio(buffer, audioFile.type, session.user.id, audioFile.name)

    const slug = await generateUniqueSlug(title)
    const parsedPrice = price ? parseFloat(price) : null

    const track = await prisma.track.create({
      data: {
        title: title.trim(),
        slug,
        description: description || null,
        audioUrl: stored.url,
        genre: genre || null,
        tags: Array.isArray(tags) ? tags : [],
        duration: stored.durationSeconds,
        price: parsedPrice && parsedPrice > 0 ? parsedPrice : null,
        isFree: !parsedPrice || parsedPrice <= 0,
        ownerId: session.user.id,
      },
    })

    await prisma.event.create({
      data: {
        type: 'track.uploaded',
        userId: session.user.id,
        trackId: track.id,
        properties: { sizeBytes: stored.sizeBytes, mimeType: stored.mimeType },
      },
    })

    return NextResponse.json({
      success: true,
      track,
      message: 'Track uploaded successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Music upload failed:', error)
    return NextResponse.json(
      { error: 'Failed to upload track' },
      { status: 500 }
    )
  }
}
