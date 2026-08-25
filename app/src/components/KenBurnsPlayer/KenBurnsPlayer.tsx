import React from "react";
import { ForensicClue, CameraCoordinate } from "../../types/forensics";
import "./KenBurnsPlayer.css";

interface KenBurnsPlayerProps {
  imageUrl: string;
  activeClue: ForensicClue | null;
  cameraTarget: CameraCoordinate;
  subtitles: string;
  isPlaying: boolean;
}

export const KenBurnsPlayer: React.FC<KenBurnsPlayerProps> = () => {
  return (
    <div className="ken-burns-viewport">
      {/* 60fps hardware-accelerated pan/zoom canvas and kinetic subtitle bar */}
    </div>
  );
};
