import type { ForensicInvestigationResult } from "../../types/forensics";

export interface SampleDossier {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  result: ForensicInvestigationResult;
}

export const SAMPLE_DOSSIERS: SampleDossier[] = [
  {
    id: "noir-detective-1974",
    title: "The Midnight Rendezvous",
    subtitle: "San Francisco Docklands, November 1974",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
    result: {
      story_title: "The Midnight Rendezvous",
      era_estimate: "Late Autumn 1974",
      contextual_mood_tags: ["Rain-Slicked Asphalt", "Low Sodium Vapor", "Harbor Fog", "Unresolved Threat"],
      ambient_sound_profile: "noir_rain_traffic",
      total_duration_sec: 18,
      narrative_mode: "detective",
      clues: [
        {
          clue_id: "clue-1",
          timestamp_sec: 0,
          observation: "Wet overcoat silhouette standing by the cast-iron lamp",
          bounding_box_2d: [150, 320, 520, 580],
          zoom_depth: 2.1,
          narration_line: "He had been waiting under the salt-crusted streetlamp for twenty minutes before the headlights cut through the fog."
        },
        {
          clue_id: "clue-2",
          timestamp_sec: 6,
          observation: "Reflected double headlight glare on wet cobblestones",
          bounding_box_2d: [620, 180, 880, 480],
          zoom_depth: 2.4,
          narration_line: "A black sedan idling in neutral, its exhaust mingling with the harbor mist. No license plate on the front bracket."
        },
        {
          clue_id: "clue-3",
          timestamp_sec: 12,
          observation: "Clenched leather briefcase in the subject's left grip",
          bounding_box_2d: [420, 510, 680, 710],
          zoom_depth: 2.5,
          narration_line: "The briefcase was never opened on the dock. It was handed through the lowered passenger window in silence."
        }
      ]
    }
  },
  {
    id: "vintage-parlor-1958",
    title: "The Unsent Correspondence",
    subtitle: "Boston Brownstone Study, October 1958",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
    result: {
      story_title: "The Unsent Correspondence",
      era_estimate: "Mid-Century 1958",
      contextual_mood_tags: ["Faded Velvet", "Dust Motes", "Analog Solitude", "Subtle Melancholy"],
      ambient_sound_profile: "muffled_parlor_clock",
      total_duration_sec: 18,
      narrative_mode: "archivist",
      clues: [
        {
          clue_id: "clue-1",
          timestamp_sec: 0,
          observation: "Heavy brass desk clock frozen at precisely 4:18 PM",
          bounding_box_2d: [210, 240, 490, 460],
          zoom_depth: 2.3,
          narration_line: "The mantel clock had wound down sixty years ago, stopped precisely at eighteen minutes past four."
        },
        {
          clue_id: "clue-2",
          timestamp_sec: 6,
          observation: "Torn parchment document bearing a broken wax seal",
          bounding_box_2d: [530, 410, 790, 720],
          zoom_depth: 2.6,
          narration_line: "On the mahogany bureau rested a letter with a broken blue seal, the ink faded to pale sepia."
        },
        {
          clue_id: "clue-3",
          timestamp_sec: 12,
          observation: "Single empty teacup with residue near the lace curtain",
          bounding_box_2d: [480, 710, 740, 930],
          zoom_depth: 2.2,
          narration_line: "The second cup was never poured. Whoever sat across the desk had left before the tea grew cold."
        }
      ]
    }
  },
  {
    id: "coastal-lighthouse-1983",
    title: "The Keeper's Log",
    subtitle: "Point Reyes Headlands, August 1983",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1400&q=80",
    result: {
      story_title: "The Keeper's Log",
      era_estimate: "Late Summer 1983",
      contextual_mood_tags: ["Salt Spray", "Wind Shear", "Overcast Solitude", "Maritime Lore"],
      ambient_sound_profile: "windy_coast_gulls",
      total_duration_sec: 18,
      narrative_mode: "storyteller",
      clues: [
        {
          clue_id: "clue-1",
          timestamp_sec: 0,
          observation: "Fresnel lens beacon rotating against the grey squall",
          bounding_box_2d: [120, 410, 390, 620],
          zoom_depth: 2.0,
          narration_line: "The beacon had swept the reef every eleven seconds since the storm warnings were broadcast at dawn."
        },
        {
          clue_id: "clue-2",
          timestamp_sec: 6,
          observation: "Weathered red radio antenna bracket on the bluff edge",
          bounding_box_2d: [450, 180, 710, 420],
          zoom_depth: 2.4,
          narration_line: "Static had overtaken the maritime frequency by noon, leaving only the sound of distant surf."
        },
        {
          clue_id: "clue-3",
          timestamp_sec: 12,
          observation: "White wake trail fading into the rocky inlet",
          bounding_box_2d: [680, 520, 920, 850],
          zoom_depth: 2.2,
          narration_line: "The trawler had cleared the headlands just in time, slipping past the breakers into deep water."
        }
      ]
    }
  }
];
