import { NextRequest, NextResponse } from 'next/server'
import { mux, MUX_WEBHOOK_SECRET, muxAudioRenditionUrl } from '@/lib/mux'
import { prisma } from '@/lib/prisma'
import type { UnwrapWebhookEvent } from '@mux/mux-node/resources/webhooks/webhooks'

async function markErrored(where: { muxUploadId: string } | { muxAssetId: string }, message: string) {
  await prisma.track.updateMany({
    where,
    data: { processingStatus: 'ERRORED', processingError: message.slice(0, 500) },
  })
}

async function handleUploadAssetCreated(data: Extract<UnwrapWebhookEvent, { type: 'video.upload.asset_created' }>['data']) {
  if (!data.asset_id) return
  await prisma.track.updateMany({
    where: { muxUploadId: data.id },
    data: { muxAssetId: data.asset_id },
  })
}

async function handleUploadErrored(_data: Extract<UnwrapWebhookEvent, { type: 'video.upload.errored' }>['data']) {
  await markErrored({ muxUploadId: _data.id }, 'Mux upload failed before an asset could be created')
}

async function handleAssetReady(data: Extract<UnwrapWebhookEvent, { type: 'video.asset.ready' }>['data']) {
  const playbackId = data.playback_ids?.[0]?.id
  const track = await prisma.track.findUnique({ where: { muxAssetId: data.id } })
  if (!track) {
    console.error(`video.asset.ready for unknown Mux asset ${data.id}`)
    return
  }

  await prisma.track.update({
    where: { id: track.id },
    data: {
      muxPlaybackId: playbackId,
      // Mux's own transcoded duration is authoritative over the best-effort
      // one music-metadata read from the raw upload before transcoding.
      duration: data.duration ? Math.round(data.duration) : track.duration,
    },
  })
  // Not READY yet — waiting on video.asset.static_renditions.ready for a
  // plain file URL a bare <audio> tag can actually play.
}

async function handleAssetErrored(data: Extract<UnwrapWebhookEvent, { type: 'video.asset.errored' }>['data']) {
  await markErrored({ muxAssetId: data.id }, data.errors?.messages?.join('; ') || 'Mux processing failed')
}

async function handleStaticRenditionsReady(data: Extract<UnwrapWebhookEvent, { type: 'video.asset.static_renditions.ready' }>['data']) {
  const track = await prisma.track.findUnique({ where: { muxAssetId: data.id } })
  if (!track) {
    console.error(`video.asset.static_renditions.ready for unknown Mux asset ${data.id}`)
    return
  }

  const playbackId = track.muxPlaybackId || data.playback_ids?.[0]?.id
  const audioFile = data.static_renditions?.files?.find((f) => f.name === 'audio.m4a')

  if (!playbackId || !audioFile || audioFile.status !== 'ready') {
    console.error(`video.asset.static_renditions.ready for asset ${data.id} but no ready audio.m4a file found`)
    return
  }

  await prisma.track.update({
    where: { id: track.id },
    data: {
      audioUrl: muxAudioRenditionUrl(playbackId),
      muxPlaybackId: playbackId,
      processingStatus: 'READY',
    },
  })
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
