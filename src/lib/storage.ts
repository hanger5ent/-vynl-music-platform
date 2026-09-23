import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { parseBuffer } from 'music-metadata'
import { mux } from '@/lib/mux'

export interface StoredAudio {
  // Null when the file isn't playable yet (e.g. Mux is still transcoding).
  // Whoever calls saveAudio must persist externalId/provider and update the
  // record later — see the Mux webhook handler at /api/mux/webhook.
  url: string | null
  durationSeconds: number
  mimeType: string
  sizeBytes: number
  provider: 'local' | 'mux'
  // The Mux direct-upload id, when provider === 'mux'. Used to correlate
  // the async video.upload.asset_created / video.asset.ready /
  // video.asset.static_renditions.ready webhook events back to this track.
  externalId?: string
}

export interface AudioStorageProvider {
  saveAudio(file: Buffer, mimeType: string, ownerId: string, originalName: string): Promise<StoredAudio>
}

/**
 * Local-disk storage for development. Files land in public/uploads/audio and
 * are served by Next.js's static file handling, so `url` is a normal path.
 * No CDN, no transcoding, no signed playback URLs — used only when Mux
 * credentials aren't configured (see the bottom of this file).
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

    return {
      url: `/uploads/audio/${ownerId}/${filename}`,
      durationSeconds: await extractDurationSeconds(file, mimeType),
      mimeType,
      sizeBytes: file.length,
      provider: 'local',
    }
  }
}

/**
 * Mux-backed storage: the uploaded bytes are pushed to a Mux direct upload,
 * which ingests and transcodes them asynchronously — there's no playable URL
 * yet by the time this function returns. The caller (POST /api/music/upload)
 * persists `externalId` as Track.muxUploadId and leaves the track in
 * PROCESSING; the Mux webhook (/api/mux/webhook) fills in audioUrl and flips
 * it to READY once the audio-only static rendition is ready.
 */
class MuxAudioStorageProvider implements AudioStorageProvider {
  async saveAudio(file: Buffer, mimeType: string, ownerId: string, _originalName: string): Promise<StoredAudio> {
    if (!mux) throw new Error('Mux is not configured')

    const durationSeconds = await extractDurationSeconds(file, mimeType)

    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXTAUTH_URL || '*',
      new_asset_settings: {
        playback_policies: ['public'],
        // A plain .m4a a bare <audio> tag can play, since the HLS .m3u8
        // Mux serves by default isn't natively playable in every browser.
        static_renditions: [{ resolution: 'audio-only' }],
        normalize_audio: true,
      },
    })

    if (!upload.url) {
      throw new Error('Mux did not return a direct upload URL')
    }

    const putResponse = await fetch(upload.url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': mimeType },
    })
    if (!putResponse.ok) {
      throw new Error(`Failed to upload audio to Mux (HTTP ${putResponse.status})`)
    }

    return {
      url: null,
      durationSeconds,
      mimeType,
      sizeBytes: file.length,
      provider: 'mux',
      externalId: upload.id,
    }
  }
}

async function extractDurationSeconds(file: Buffer, mimeType: string): Promise<number> {
  try {
    const metadata = await parseBuffer(file, mimeType)
    return Math.round(metadata.format.duration || 0)
  } catch {
    // Some files (or truncated uploads) aren't parseable; fall back to 0
    // rather than failing the upload over metadata extraction. Mux will
    // report the real duration once it finishes processing anyway.
    return 0
  }
}

export const audioStorage: AudioStorageProvider = mux
  ? new MuxAudioStorageProvider()
  : new LocalAudioStorageProvider()
