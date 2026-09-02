/**
 * Gemini's TTS audio modality returns raw signed 16-bit little-endian PCM
 * (typically mono @ 24kHz), not a container format. To make it playable by an
 * <audio> element or decodable by Web Audio, we wrap the samples in a minimal
 * 44-byte WAV header. No transcode, no dependency — compression is left to the
 * export layer, where the MP4 muxer owns the codec choice.
 */

/** Parse the sample rate out of a Gemini audio mime string like `audio/L16;codec=pcm;rate=24000`. */
export function parsePcmSampleRate(mimeType: string | undefined, fallback = 24000): number {
  if (!mimeType) return fallback;
  const match = mimeType.match(/rate=(\d+)/i);
  return match ? parseInt(match[1], 10) : fallback;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Wrap raw base64 PCM in a WAV container and return a playable data URL.
 * @param base64Pcm  Raw signed 16-bit LE PCM samples, base64-encoded.
 * @param sampleRate Samples per second (default 24000, Gemini TTS default).
 * @param channels   Channel count (default 1, mono).
 */
export function pcmBase64ToWavDataUrl(
  base64Pcm: string,
  sampleRate = 24000,
  channels = 1
): string {
  const pcm = base64ToBytes(base64Pcm);
  const bitsPerSample = 16;
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true); // ChunkSize
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, pcm.length, true); // Subchunk2Size

  const wav = new Uint8Array(44 + pcm.length);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcm, 44);

  return `data:audio/wav;base64,${bytesToBase64(wav)}`;
}
