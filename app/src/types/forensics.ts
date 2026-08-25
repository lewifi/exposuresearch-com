export interface ForensicInvestigationResult {
  era_estimate: string;
  contextual_mood_tags: string[];
  ambient_sound_profile: AmbientSoundProfile;
  total_duration_sec: number;
  story_title: string;
  narrative_mode: "detective" | "storyteller" | "archivist";
  clues: ForensicClue[];
}

export interface ForensicClue {
  clue_id: string;
  timestamp_sec: number;
  observation: string;
  bounding_box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  zoom_depth: number; // e.g. 1.8 to 2.5
  narration_line: string;
  confidence_score?: number;
}

export type AmbientSoundProfile = 
  | "tape_hiss_polaroid"
  | "noir_rain_traffic"
  | "windy_coast_gulls"
  | "muffled_parlor_clock"
  | "suburban_cicadas_summer";

export interface CameraCoordinate {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
}

export interface AudioTrackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isDucking: boolean;
  ambientVolume: number;
  voiceVolume: number;
}
