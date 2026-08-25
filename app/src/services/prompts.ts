import { ForensicInvestigationResult } from "../types/forensics";

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
