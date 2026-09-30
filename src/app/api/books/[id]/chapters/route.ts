import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audioStorage } from '@/lib/storage'

const ALLOWED_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-flac']
const MAX_SIZE_BYTES = 200 * 1024 * 1024 // audiobook chapters run longer than a typical track

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const book = await prisma.book.findUnique({ where: { id: params.id } })
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }
  if (book.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'You can only add chapters to your own audiobooks' }, { status: 403 })
  }
  if (book.format !== 'AUDIOBOOK') {
    return NextResponse.json({ error: 'This book is not an audiobook' }, { status: 400 })
  }

  const formData = await req.formData()
  const audioFile = formData.get('audio') as File | null
  const title = formData.get('title') as string | null
  const chapterNumber = parseInt((formData.get('chapterNumber') as string) || '', 10)

  if (!audioFile || !title?.trim()) {
    return NextResponse.json({ error: 'Audio file and chapter title are required' }, { status: 400 })
  }
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
    return NextResponse.json({ error: 'A valid chapter number is required' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(audioFile.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only MP3, WAV, and FLAC files are allowed.' }, { status: 400 })
  }
  if (audioFile.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File is too large. Maximum size is 200MB.' }, { status: 400 })
  }

  const existing = await prisma.audiobookChapter.findUnique({
    where: { bookId_chapterNumber: { bookId: book.id, chapterNumber } },
  })
  if (existing) {
    return NextResponse.json({ error: `Chapter ${chapterNumber} already exists for this audiobook` }, { status: 409 })
  }

  const buffer = Buffer.from(await audioFile.arrayBuffer())
  const stored = await audioStorage.saveAudio(buffer, audioFile.type, session.user.id, audioFile.name)

  const chapter = await prisma.audiobookChapter.create({
    data: {
      bookId: book.id,
      title: title.trim(),
      chapterNumber,
      duration: stored.durationSeconds,
      audioUrl: stored.url,
      muxUploadId: stored.provider === 'mux' ? stored.externalId : null,
      processingStatus: stored.url ? 'READY' : 'PROCESSING',
    },
  })

  return NextResponse.json({
    chapter,
    message: stored.url ? 'Chapter uploaded successfully' : 'Chapter uploaded — processing audio now',
  }, { status: 201 })
}
