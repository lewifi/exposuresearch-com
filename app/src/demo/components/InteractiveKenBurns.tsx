import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Share2, Sparkles } from "lucide-react";
import type { ForensicClue, ForensicInvestigationResult } from "../../types/forensics";
import { calculateCameraTarget, getKenBurnsTransformStyle } from "../../utils/coordinates";
import { foleyEngine } from "../audio/ProceduralFoley";
import "./InteractiveKenBurns.css";

interface InteractiveKenBurnsProps {
  imageDataUrl: string;
  result: ForensicInvestigationResult;
  onOpenExport: () => void;
}

export const InteractiveKenBurns: React.FC<InteractiveKenBurnsProps> = ({
  imageDataUrl,
  result,
  onOpenExport
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeClueIndex, setActiveClueIndex] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const clues = result.clues;
  const currentClue: ForensicClue = clues[activeClueIndex] || clues[0];
  const cameraTarget = calculateCameraTarget(currentClue.bounding_box_2d, currentClue.zoom_depth || 2.2);
  const transformStyle = getKenBurnsTransformStyle(cameraTarget);

  // Playback timer & clue progression
  useEffect(() => {
    foleyEngine.start(result.ambient_sound_profile);

    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setPlaybackTime((prev) => {
          const next = prev + 0.5;
          if (next >= result.total_duration_sec) {
            return 0; // loop playback
          }
          return next;
        });
      }, 500);
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
      foleyEngine.stop();
    };
  }, [isPlaying, result.ambient_sound_profile, result.total_duration_sec]);

  // Sync active clue based on timestamp
  useEffect(() => {
    let bestIndex = 0;
    for (let i = 0; i < clues.length; i++) {
      if (playbackTime >= clues[i].timestamp_sec) {
        bestIndex = i;
      }
    }
    setActiveClueIndex(bestIndex);
  }, [playbackTime, clues]);

  // Handle Mute
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      foleyEngine.setVolume(next ? 0 : 0.25);
      return next;
    });
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setPlaybackTime(0);
    setActiveClueIndex(0);
    setIsPlaying(true);
  };

  const handleClueSelect = (index: number) => {
    setActiveClueIndex(index);
    setPlaybackTime(clues[index].timestamp_sec);
  };

  return (
    <div className="ken-burns-director-root">
      <div className="director-cinema-stage">
        <div className="cinema-viewport">
          <img
            src={imageDataUrl}
            alt={result.story_title}
            className="cinema-image"
            style={transformStyle}
          />
        </div>

        {/* Ambient Film Grain and Vignette */}
        <div className="cinema-vignette-overlay" />
        <div className="cinema-letterbox letterbox-top" />
        <div className="cinema-letterbox letterbox-bottom" />

        {/* Active Clue Bounding Box Anchor Indicator */}
        <div className="cinema-hud-overlay">
          <div className="cinema-hud-clue-badge">
            <Sparkles size={14} className="hud-sparkle" />
            <span>FOCAL POINT: EVIDENCE #{activeClueIndex + 1}</span>
          </div>
          <span className="cinema-hud-timecode">
            {Math.floor(playbackTime)}s / {result.total_duration_sec}s
          </span>
        </div>

        {/* Kinetic Subtitle Bar */}
        <div className="cinema-subtitles-bar">
          <p className="cinema-subtitle-line">
            "{currentClue.narration_line}"
          </p>
        </div>
      </div>

      {/* Playback Controls & Timeline Scrubber */}
      <div className="director-controls-panel">
        <div className="playback-buttons-row">
          <button
            type="button"
            className="btn-playback-control"
            onClick={handleTogglePlay}
            title={isPlaying ? "Pause playback" : "Start playback"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            type="button"
            className="btn-playback-control"
            onClick={handleRestart}
            title="Restart investigation from beginning"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            className="btn-playback-control"
            onClick={handleToggleMute}
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <div className="timeline-scrubber-track">
            <div
              className="timeline-progress-fill"
              style={{ width: `${(playbackTime / result.total_duration_sec) * 100}%` }}
            />
          </div>

          <button
            type="button"
            className="btn-export-trigger"
            onClick={onOpenExport}
            title="Export vertical MP4 video"
          >
            <Share2 size={16} />
            <span>Export Video</span>
          </button>
        </div>

        {/* Clue Timeline Chapters */}
        <div className="clue-chapters-bar">
          {clues.map((clue, idx) => (
            <button
              key={clue.clue_id}
              type="button"
              className={`btn-clue-chapter ${idx === activeClueIndex ? "btn-clue-chapter--active" : ""}`}
              onClick={() => handleClueSelect(idx)}
            >
              <span className="chapter-number">0{idx + 1}</span>
              <span className="chapter-name">{clue.observation}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
