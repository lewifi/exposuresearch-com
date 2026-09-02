import type { ForensicInvestigationResult } from "../types/forensics";

export type NarrativeMode = "detective" | "storyteller" | "archivist";

export const FORENSIC_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    story_title: { type: "STRING" },
    era_estimate: { type: "STRING" },
    contextual_mood_tags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "3-4 dynamic mood/texture tags inferred from lighting, era, and tension (e.g., '1984 neon dread', 'sun-bleached nostalgia')"
    },
    ambient_sound_profile: {
      type: "STRING",
      enum: ["tape_hiss_polaroid", "noir_rain_traffic", "windy_coast_gulls", "muffled_parlor_clock", "suburban_cicadas_summer"]
    },
    total_duration_sec: { type: "NUMBER" },
    clues: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          clue_id: { type: "STRING" },
          timestamp_sec: { type: "NUMBER" },
          observation: { type: "STRING", description: "Specific physical detail observed in the photo" },
          bounding_box_2d: { 
            type: "ARRAY", 
            items: { "type": "INTEGER" },
            description: "[ymin, xmin, ymax, xmax] normalized 0-1000"
          },
          zoom_depth: { type: "NUMBER", description: "Zoom scale from 1.5 to 2.8" },
          narration_line: { type: "STRING", description: "Story narration focusing specifically on this clue" }
        },
        required: ["clue_id", "timestamp_sec", "observation", "bounding_box_2d", "zoom_depth", "narration_line"]
      }
    }
  },
  required: ["story_title", "era_estimate", "contextual_mood_tags", "ambient_sound_profile", "total_duration_sec", "clues"]
};

export function buildForensicPrompt(mode: "detective" | "storyteller" | "archivist"): string {
  const modeInstructions = {
    detective: "Adopt a hardboiled noir investigator persona. Speak with sharp, observational brevity. Treat every detail as evidence of a hidden event.",
    storyteller: "Adopt an evocative, cinematic storyteller persona. Weave an emotional, unexpected backstory connecting the physical details.",
    archivist: "Adopt a forensic historical archivist persona. Deduce chronological and cultural realities from clothing, objects, and lighting."
  };

  return `You are analyzing a photograph. ${modeInstructions[mode]}
CRITICAL RULES:
1. Do not use generic cliches (avoid 'frozen in time', 'whispers of the past', 'sepia-toned memory').
2. Identify 3 to 5 hyper-specific physical objects, reflections, textures, or anomalies in the image.
3. Every narration line MUST directly connect to its specific physical bounding box.
4. Provide precise 2D bounding boxes [ymin, xmin, ymax, xmax] on a 0-1000 coordinate system.`;
}

/**
 * Voice persona per narrative mode (see architecture.md Module 3 — Persona Matrix).
 * Overridable at runtime via GEMINI_VOICE_NAME, but this is the mode-aware default.
 */
export const VOICE_BY_MODE: Record<NarrativeMode, string> = {
  detective: "Charon", // world-weary, gravelly, clipped
  storyteller: "Aoede", // evocative, dynamic emotional inflection
  archivist: "Kore" // measured, clinical, historical gravity
};

/** High-level delivery instruction the TTS model applies to the whole read. */
const DELIVERY_DIRECTIVE: Record<NarrativeMode, string> = {
  detective: "Read the following as a world-weary noir detective — low, gravelly, clipped cadence, cynical restraint.",
  storyteller: "Read the following as a cinematic storyteller — evocative, warm, with dynamic emotional inflection and literary pacing.",
  archivist: "Read the following as a forensic archivist — measured, clinical, with quiet historical gravity."
};

/**
 * Pick an inline stage-direction cue for a clue, biased by the run's mood tags.
 * Keeps the expressive tags matched to the extracted atmosphere rather than random.
 */
function stageCueForClue(mode: NarrativeMode, moodTags: string[], index: number): string {
  const mood = moodTags.join(" ").toLowerCase();
  const tense = /tension|dread|noir|cold|threat|unease/.test(mood);
  const warm = /warm|nostalg|gentle|summer|golden|memory/.test(mood);

  if (index === 0) return tense ? "[hushed, deliberate]" : "[quiet, setting the scene]";
  if (tense) return "[cynical, low]";
  if (warm) return "[warm reflection]";
  if (mode === "archivist") return "[measured deduction]";
  return "[a beat of anticipation]";
}

/** Prefix a block of cue-tagged lines with the mode's delivery directive. */
function withDirective(mode: NarrativeMode, body: string): string {
  return `${DELIVERY_DIRECTIVE[mode]}\n\n${body}`;
}

/**
 * Split the narration into one TTS "leg" per clue (see architecture.md / the Lumo
 * Dreams chunking pattern). One sentence per leg is the finest useful granularity
 * and it serves both playback modes:
 *   - Manual (a Next button that pauses after each sentence): the human beat between
 *     sentences dwarfs the ~8s synth, so the next leg is always ready on tap.
 *   - Autoplay: fire the legs in PARALLEL at t=0 and auto-advance on each leg's
 *     `ended` event; the ForensicScanner masks leg 0's initial latency.
 * Per-sentence pacing also matches the clue-by-clue Ken Burns cadence — each leg is
 * bolted to its own evidence zoom — so the beat between legs is the intended rhythm.
 * Returned legs are index-aligned with the time-ordered clues.
 */
export function buildNarrationLegs(
  result: ForensicInvestigationResult,
  mode: NarrativeMode
): string[] {
  return result.clues
    .slice()
    .sort((a, b) => a.timestamp_sec - b.timestamp_sec)
    .map((clue, i) => {
      const cue = stageCueForClue(mode, result.contextual_mood_tags, i);
      return withDirective(mode, `${cue} ${clue.narration_line.trim()}`);
    });
}
