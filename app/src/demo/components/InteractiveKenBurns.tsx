import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Share2, Sparkles } from "lucide-react";
import type { ForensicClue, ForensicInvestigationResult } from "../../types/forensics";
import { calculateCameraTarget, getKenBurnsTransformStyle, getBoundingBoxRect } from "../../utils/coordinates";
import { foleyEngine } from "../audio/ProceduralFoley";
import { synthesizeVoiceWithGemini } from "../../services/gemini";
import { buildNarrationLegs, VOICE_BY_MODE } from "../../services/prompts";
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
  // One voice "leg" per clue, index-aligned to the time-ordered clues below.
  // null = not yet synthesized (or unavailable — no key/error), so playback stays
  // foley-only and silent for that leg rather than blocking.
  const [legUrls, setLegUrls] = useState<(string | null)[]>([]);
  const timerRef = useRef<number | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  const clues = React.useMemo(
    () => [...result.clues].sort((a, b) => a.timestamp_sec - b.timestamp_sec),
    [result.clues]
  );
  const currentClue: ForensicClue = clues[activeClueIndex] || clues[0];
  const cameraTarget = calculateCameraTarget(currentClue.bounding_box_2d, currentClue.zoom_depth || 2.2);
  const transformStyle = getKenBurnsTransformStyle(cameraTarget);
  // Corner-bracket reticle, tightened toward the box center so it frames a smaller
  // area than the raw detection (reads as a focused "lock-on" rather than a full box).
  const rawRect = getBoundingBoxRect(currentClue.bounding_box_2d);
  const RETICLE_SHRINK = 0.68;
  const reticleRect = {
    left: rawRect.left + (rawRect.width * (1 - RETICLE_SHRINK)) / 2,
    top: rawRect.top + (rawRect.height * (1 - RETICLE_SHRINK)) / 2,
    width: rawRect.width * RETICLE_SHRINK,
    height: rawRect.height * RETICLE_SHRINK
  };

  const currentLegUrl = legUrls[activeClueIndex] ?? null;
  const hasNarration = legUrls.some(Boolean);

  // Synthesize one expressive leg per clue (persona voice + mood-matched stage cue),
  // all fired in PARALLEL: the short first leg lands quickly and starts talking while
  // the rest finish in the background. No key/error -> that leg stays null, silent.
  useEffect(() => {
    let cancelled = false;
    const legScripts = buildNarrationLegs(result, result.narrative_mode);
    const voice =
      import.meta.env.GEMINI_VOICE_NAME ||
      import.meta.env.VITE_GEMINI_VOICE_NAME ||
      VOICE_BY_MODE[result.narrative_mode];

    setLegUrls(new Array(legScripts.length).fill(null));

    legScripts.forEach((script, i) => {
      synthesizeVoiceWithGemini(script, voice)
        .then((url) => {
          if (cancelled || !url) return;
          setLegUrls((prev) => {
            const next = prev.slice();
            next[i] = url;
            return next;
          });
        })
        .catch(() => undefined);
    });

    return () => {
      cancelled = true;
    };
  }, [result]);

  // Timeline clock. When voice narration exists it drives clue advancement off each
  // leg's `ended` event (audio is the source of truth). Only when there is NO voice
  // (foley-only fallback) does the timestamp interval step the clues.
  useEffect(() => {
    foleyEngine.start(result.ambient_sound_profile);

    if (isPlaying && !hasNarration) {
      timerRef.current = window.setInterval(() => {
        setPlaybackTime((prev) => {
          const next = prev + 0.5;
          if (next >= result.total_duration_sec) return 0; // loop playback
          return next;
        });
      }, 500);
    }

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      foleyEngine.stop();
    };
  }, [isPlaying, hasNarration, result.ambient_sound_profile, result.total_duration_sec]);

  // Foley-only mode: derive the active clue from the interval clock.
  useEffect(() => {
    if (hasNarration) return;
    let bestIndex = 0;
    for (let i = 0; i < clues.length; i++) {
      if (playbackTime >= clues[i].timestamp_sec) bestIndex = i;
    }
    setActiveClueIndex(bestIndex);
  }, [playbackTime, clues, hasNarration]);

  // Play the current leg and duck the ambient foley -6dB while a voice leg speaks.
  useEffect(() => {
    const voice = voiceRef.current;
    if (!voice || !currentLegUrl) {
      foleyEngine.duckAudio(false);
      return;
    }

    if (isPlaying && !isMuted) {
      voice.play().catch(() => undefined);
      foleyEngine.duckAudio(true);
    } else {
      voice.pause();
      foleyEngine.duckAudio(false);
    }

    return () => {
      foleyEngine.duckAudio(false);
    };
  }, [currentLegUrl, isPlaying, isMuted]);

  // Auto-advance to the next clue when a leg finishes (voice-driven playback).
  const handleLegEnded = () => {
    foleyEngine.duckAudio(false);
    if (!isPlaying) return;
    setActiveClueIndex((prev) => {
      const next = prev + 1 >= clues.length ? 0 : prev + 1;
      setPlaybackTime(clues[next].timestamp_sec);
      return next;
    });
  };

  // Handle Mute
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      foleyEngine.setVolume(next ? 0 : 0.14);
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
    if (voiceRef.current) {
      voiceRef.current.currentTime = 0;
    }
  };

  const handleClueSelect = (index: number) => {
    setActiveClueIndex(index);
    setPlaybackTime(clues[index].timestamp_sec);
  };

  return (
    <div className="ken-burns-director-root">
      {hasNarration && (
        <audio
          ref={voiceRef}
          src={currentLegUrl ?? undefined}
          preload="auto"
          onEnded={handleLegEnded}
        />
      )}
      <div className="director-cinema-stage">
        <div className="cinema-viewport">
          <div className="cinema-transform-layer" style={transformStyle}>
            <img
              src={imageDataUrl}
              alt={result.story_title}
              className="cinema-image"
            />
            {/* Evidence reticle — frames the exact region Gemini flagged. Lives inside
                the transform layer so it zooms with the camera. Re-keyed per clue so
                the draw-on animation replays on each reveal. */}
            <div
              key={currentClue.clue_id}
              className="evidence-reticle"
              style={{
                left: `${reticleRect.left}%`,
                top: `${reticleRect.top}%`,
                width: `${reticleRect.width}%`,
                height: `${reticleRect.height}%`,
                ["--reticle-scale" as string]: cameraTarget.scale
              }}
            >
              <span className="reticle-corner rc-tl" />
              <span className="reticle-corner rc-tr" />
              <span className="reticle-corner rc-bl" />
              <span className="reticle-corner rc-br" />
            </div>
          </div>
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
