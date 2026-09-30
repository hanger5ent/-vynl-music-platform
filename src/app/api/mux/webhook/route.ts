import { NextRequest, NextResponse } from 'next/server'
import { mux, MUX_WEBHOOK_SECRET, muxAudioRenditionUrl } from '@/lib/mux'
import { prisma } from '@/lib/prisma'
import type { UnwrapWebhookEvent } from '@mux/mux-node/resources/webhooks/webhooks'

// Mux assets back both Track and AudiobookChapter audio, each with their
// own muxUploadId/muxAssetId columns, so every handler below has to check
// both tables rather than assuming it's always a Track.

async function markErrored(where: { muxUploadId: string } | { muxAssetId: string }, message: string) {
  const data = { processingStatus: 'ERRORED' as const, processingError: message.slice(0, 500) }
  await prisma.track.updateMany({ where, data })
  await prisma.audiobookChapter.updateMany({ where, data })
}

async function handleUploadAssetCreated(data: Extract<UnwrapWebhookEvent, { type: 'video.upload.asset_created' }>['data']) {
  if (!data.asset_id) return
  const where = { muxUploadId: data.id }
  await prisma.track.updateMany({ where, data: { muxAssetId: data.asset_id } })
  await prisma.audiobookChapter.updateMany({ where, data: { muxAssetId: data.asset_id } })
}

async function handleUploadErrored(_data: Extract<UnwrapWebhookEvent, { type: 'video.upload.errored' }>['data']) {
  await markErrored({ muxUploadId: _data.id }, 'Mux upload failed before an asset could be created')
}

async function handleAssetReady(data: Extract<UnwrapWebhookEvent, { type: 'video.asset.ready' }>['data']) {
  const playbackId = data.playback_ids?.[0]?.id
  const duration = data.duration ? Math.round(data.duration) : undefined

  const track = await prisma.track.findUnique({ where: { muxAssetId: data.id } })
  if (track) {
    await prisma.track.update({
      where: { id: track.id },
      data: { muxPlaybackId: playbackId, duration: duration ?? track.duration },
    })
    return
  }

  const chapter = await prisma.audiobookChapter.findUnique({ where: { muxAssetId: data.id } })
  if (chapter) {
    await prisma.audiobookChapter.update({
      where: { id: chapter.id },
      data: { muxPlaybackId: playbackId, duration: duration ?? chapter.duration },
    })
    return
  }

  console.error(`video.asset.ready for unknown Mux asset ${data.id}`)
  // Not READY yet either way — waiting on video.asset.static_renditions.ready
  // for a plain file URL a bare <audio> tag can actually play.
}

async function handleAssetErrored(data: Extract<UnwrapWebhookEvent, { type: 'video.asset.errored' }>['data']) {
  await markErrored({ muxAssetId: data.id }, data.errors?.messages?.join('; ') || 'Mux processing failed')
}

async function handleStaticRenditionsReady(data: Extract<UnwrapWebhookEvent, { type: 'video.asset.static_renditions.ready' }>['data']) {
  const track = await prisma.track.findUnique({ where: { muxAssetId: data.id } })
  const chapter = track ? null : await prisma.audiobookChapter.findUnique({ where: { muxAssetId: data.id } })
  const record = track || chapter
  if (!record) {
    console.error(`video.asset.static_renditions.ready for unknown Mux asset ${data.id}`)
    return
  }

  const playbackId = record.muxPlaybackId || data.playback_ids?.[0]?.id
  const audioFile = data.static_renditions?.files?.find((f) => f.name === 'audio.m4a')

  if (!playbackId || !audioFile || audioFile.status !== 'ready') {
    console.error(`video.asset.static_renditions.ready for asset ${data.id} but no ready audio.m4a file found`)
    return
  }

  const updateData = {
    audioUrl: muxAudioRenditionUrl(playbackId),
    muxPlaybackId: playbackId,
    processingStatus: 'READY' as const,
  }

  if (track) {
    await prisma.track.update({ where: { id: track.id }, data: updateData })
  } else if (chapter) {
    await prisma.audiobookChapter.update({ where: { id: chapter.id }, data: updateData })
  }
}

async function handleStaticRenditionsErrored(data: Extract<UnwrapWebhookEvent, { type: 'video.asset.static_renditions.errored' }>['data']) {
  await markErrored({ muxAssetId: data.id }, 'Mux failed to generate a playable audio file for this track')
}

export async function POST(req: NextRequest) {
  if (!mux || !MUX_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Mux webhooks are not configured' }, { status: 503 })
  }

  const rawBody = await req.text()

  let event: UnwrapWebhookEvent
  try {
    event = await mux.webhooks.unwrap(rawBody, req.headers, MUX_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Mux webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'video.upload.asset_created':
        await handleUploadAssetCreated(event.data)
        break
      case 'video.upload.errored':
        await handleUploadErrored(event.data)
        break
      case 'video.asset.ready':
        await handleAssetReady(event.data)
        break
      case 'video.asset.errored':
        await handleAssetErrored(event.data)
        break
      case 'video.asset.static_renditions.ready':
        await handleStaticRenditionsReady(event.data)
        break
      case 'video.asset.static_renditions.errored':
        await handleStaticRenditionsErrored(event.data)
        break
      default:
        // Unhandled event type — acknowledge so Mux doesn't retry it.
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Mux webhook handler failed for ${event.type}:`, error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
