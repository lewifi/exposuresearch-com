import type { AudioTrackState, AmbientSoundProfile } from "../../types/forensics";
import "./AudioMixerControls.css";

interface AudioMixerControlsProps {
  state: AudioTrackState;
  ambientProfile: AmbientSoundProfile;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (voice: number, ambient: number) => void;
}

export const AudioMixerControls: React.FC<AudioMixerControlsProps> = (props) => {
  return (
    <div className="audio-mixer-container" onClick={props.onTogglePlay}>
      <span>Mixer {props.ambientProfile}</span>
    </div>
  );
};
