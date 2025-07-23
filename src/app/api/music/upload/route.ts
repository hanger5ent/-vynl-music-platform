import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an artist
    if (!session.user.isArtist) {
      return NextResponse.json({ error: 'Only artists can upload music' }, { status: 403 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const genre = formData.get('genre') as string
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const price = formData.get('price') as string

    if (!audioFile || !title) {
      return NextResponse.json({ 
        error: 'Audio file and title are required' 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only MP3, WAV, and FLAC files are allowed.' 
      }, { status: 400 })
    }

    // For now, simulate file upload - in production, you'd upload to cloud storage
    const audioUrl = `https://storage.example.com/tracks/${Date.now()}-${audioFile.name}`
    
    // Create track record (mock implementation)
    const track = {
      id: `track_${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      audioUrl,
      genre,
      tags,
      price: price ? parseFloat(price) : null,
      isFree: !price || parseFloat(price) === 0,
      ownerId: session.user.id,
      duration: 180, // Mock duration
      playCount: 0,
      likeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      track,
      message: 'Track uploaded successfully'
    })

  } catch (error) {
    console.error('Music upload failed:', error)
    return NextResponse.json(
      { error: 'Failed to upload track' },
      { status: 500 }
    )
  }
}
