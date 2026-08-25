import React from "react";
import { AudioTrackState, AmbientSoundProfile } from "../../types/forensics";
import "./AudioMixerControls.css";

interface AudioMixerControlsProps {
  state: AudioTrackState;
  ambientProfile: AmbientSoundProfile;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (voice: number, ambient: number) => void;
}

export const AudioMixerControls: React.FC<AudioMixerControlsProps> = () => {
  return (
    <div className="audio-mixer-container">
      {/* Play/pause, waveform timeline scrubber, ambient volume slider, ducking indicator */}
    </div>
  );
};
