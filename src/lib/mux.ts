import Mux from '@mux/mux-node'

const tokenId = process.env.MUX_TOKEN_ID
const tokenSecret = process.env.MUX_TOKEN_SECRET

if (!tokenId || !tokenSecret) {
  console.warn('MUX_TOKEN_ID/MUX_TOKEN_SECRET are not set - audio uploads will use local disk storage instead of Mux')
}

export const mux = tokenId && tokenSecret ? new Mux({ tokenId, tokenSecret }) : null

export const MUX_WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SECRET

// The static-rendition audio file Mux produces once processing finishes —
// a plain .m4a, unlike the HLS .m3u8 manifest at stream.mux.com/{id}, which
// a bare <audio> tag can't play in most browsers without hls.js.
export function muxAudioRenditionUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}/audio.m4a`
}
