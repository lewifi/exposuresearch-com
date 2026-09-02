import type { ForensicInvestigationResult } from "../types/forensics";
import { FORENSIC_RESPONSE_SCHEMA, buildForensicPrompt } from "./prompts";
import { pcmBase64ToWavDataUrl, parsePcmSampleRate } from "../utils/pcm";

const GENERAL_API_KEY = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const VISION_API_KEY = import.meta.env.GEMINI_VISION_API_KEY || import.meta.env.VITE_GEMINI_VISION_API_KEY || GENERAL_API_KEY;
const TTS_API_KEY = import.meta.env.GEMINI_TTS_API_KEY || import.meta.env.VITE_GEMINI_TTS_API_KEY || GENERAL_API_KEY;

const VISION_MODEL = import.meta.env.GEMINI_VISION_MODEL || import.meta.env.VITE_GEMINI_VISION_MODEL || "gemini-3.1-flash-lite";
const TTS_MODEL = import.meta.env.GEMINI_TTS_MODEL || import.meta.env.VITE_GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview";
const VOICE_NAME = import.meta.env.GEMINI_VOICE_NAME || import.meta.env.VITE_GEMINI_VOICE_NAME || "Kore";

/**
 * Executes a single-pass forensic clue extraction using Gemini 3.1 Flash-Lite
 */
export async function analyzePhotoWithGemini(
  base64DataUrl: string,
  mode: "detective" | "storyteller" | "archivist" = "detective"
): Promise<ForensicInvestigationResult> {
  if (!VISION_API_KEY) {
    throw new Error("GEMINI_VISION_API_KEY_MISSING");
  }

  // Strip prefix (e.g. data:image/jpeg;base64,)
  const base64Data = base64DataUrl.split(",")[1] || base64DataUrl;
  const mimeType = base64DataUrl.match(/data:([^;]+);/)?.[1] || "image/jpeg";

  const systemPrompt = buildForensicPrompt(mode);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${VISION_API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: FORENSIC_RESPONSE_SCHEMA,
      temperature: 0.7
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Vision API Error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error("No structured output returned from Gemini Vision model.");
  }

  const parsed = JSON.parse(textOutput) as ForensicInvestigationResult;
  return {
    ...parsed,
    narrative_mode: mode
  };
}

/**
 * Synthesizes voice narration using Gemini 3.1 Flash-TTS-Preview
 */
export async function synthesizeVoiceWithGemini(
  narrationText: string,
  voiceName: string = VOICE_NAME
): Promise<string | null> {
  if (!TTS_API_KEY) return null;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${TTS_API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [{ text: narrationText }]
      }
    ],
    generationConfig: {
      response_modalities: ["AUDIO"],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: {
            voice_name: voiceName
          }
        }
      }
    }
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const part = json.candidates?.[0]?.content?.parts?.[0];
    const inlineAudio = part?.inline_data?.data;
    if (inlineAudio) {
      // Gemini's audio modality returns raw signed-16 PCM (default 24kHz mono),
      // NOT mp3. Wrap it in a WAV container so it is actually playable/decodable.
      const sampleRate = parsePcmSampleRate(part?.inline_data?.mime_type);
      return pcmBase64ToWavDataUrl(inlineAudio, sampleRate);
    }
    return null;
  } catch {
    return null;
  }
}
