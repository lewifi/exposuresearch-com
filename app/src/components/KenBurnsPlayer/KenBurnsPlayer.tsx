import type { ForensicClue, CameraCoordinate } from "../../types/forensics";
import "./KenBurnsPlayer.css";

interface KenBurnsPlayerProps {
  imageUrl: string;
  activeClue: ForensicClue | null;
  cameraTarget: CameraCoordinate;
  subtitles: string;
  isPlaying: boolean;
}

export const KenBurnsPlayer: React.FC<KenBurnsPlayerProps> = (props) => {
  return (
    <div className="ken-burns-viewport">
      <span>Ken Burns {props.subtitles}</span>
    </div>
  );
};
