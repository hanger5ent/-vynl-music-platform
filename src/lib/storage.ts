import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { parseBuffer } from 'music-metadata'

export interface StoredAudio {
  url: string
  durationSeconds: number
  mimeType: string
  sizeBytes: number
}

export interface AudioStorageProvider {
  saveAudio(file: Buffer, mimeType: string, ownerId: string, originalName: string): Promise<StoredAudio>
}

/**
 * Local-disk storage for development. Files land in public/uploads/audio and
 * are served by Next.js's static file handling, so `url` is a normal path.
 *
 * TODO: swap for a MuxAudioStorageProvider (or S3/R2) before production —
 * this has no CDN, no transcoding, and no signed playback URLs.
 */
class LocalAudioStorageProvider implements AudioStorageProvider {
  private readonly uploadRoot = path.join(process.cwd(), 'public', 'uploads', 'audio')

  async saveAudio(file: Buffer, mimeType: string, ownerId: string, originalName: string): Promise<StoredAudio> {
    const dir = path.join(this.uploadRoot, ownerId)
    await mkdir(dir, { recursive: true })

    const ext = path.extname(originalName) || '.mp3'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filePath = path.join(dir, filename)

    await writeFile(filePath, file)

    let durationSeconds = 0
    try {
      const metadata = await parseBuffer(file, mimeType)
      durationSeconds = Math.round(metadata.format.duration || 0)
    } catch {
      // Some files (or truncated uploads) aren't parseable; fall back to 0
      // rather than failing the upload over metadata extraction.
      durationSeconds = 0
    }

    return {
      url: `/uploads/audio/${ownerId}/${filename}`,
      durationSeconds,
      mimeType,
      sizeBytes: file.length,
    }
  }
}

export const audioStorage: AudioStorageProvider = new LocalAudioStorageProvider()
