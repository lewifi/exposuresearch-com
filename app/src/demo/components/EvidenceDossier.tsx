import React from "react";
import { FolderArchive, Radio, Clock, MapPin, Crosshair, Sparkles } from "lucide-react";
import type { ForensicInvestigationResult, ForensicClue } from "../../types/forensics";
import "./EvidenceDossier.css";

/** Format a duration in seconds as mm:ss (e.g. 6 -> "00:06", 72 -> "01:12"). */
function formatTimecode(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

interface EvidenceDossierProps {
  result: ForensicInvestigationResult;
  activeClueId: string;
  onSelectClue: (clue: ForensicClue) => void;
  onReset: () => void;
}

export const EvidenceDossier: React.FC<EvidenceDossierProps> = ({
  result,
  activeClueId,
  onSelectClue,
  onReset
}) => {
  return (
    <div className="evidence-dossier-root">
      <div className="dossier-header-bar">
        <div className="dossier-header-left">
          <FolderArchive size={20} className="dossier-icon" />
          <h2 className="dossier-title">{result.story_title}</h2>
        </div>
        <button type="button" className="btn-retake" onClick={onReset}>
          Investigate New Photo
        </button>
      </div>

      <div className="dossier-metadata-strip">
        <div className="metadata-item">
          <Clock size={14} />
          <span className="metadata-label">ESTIMATED ERA:</span>
          <span className="metadata-value">{result.era_estimate}</span>
        </div>

        <div className="metadata-item">
          <Radio size={14} />
          <span className="metadata-label">AMBIENT PROFILE:</span>
          <span className="metadata-value">{result.ambient_sound_profile.replace(/_/g, " ").toUpperCase()}</span>
        </div>

        <div className="metadata-item">
          <MapPin size={14} />
          <span className="metadata-label">MODE:</span>
          <span className="metadata-value">{result.narrative_mode.toUpperCase()}</span>
        </div>
      </div>

      {/* Mood Tags Row */}
      <div className="dossier-mood-row">
        {result.contextual_mood_tags.map((tag, idx) => (
          <span key={idx} className="dossier-mood-tag">
            <Sparkles size={12} />
            <span>{tag}</span>
          </span>
        ))}
      </div>

      {/* Clues Forensic Breakdown */}
      <div className="dossier-clues-section">
        <h3 className="clues-heading">FORENSIC EVIDENCE CHRONOLOGY</h3>
        <div className="clues-stack">
          {result.clues.map((clue, idx) => {
            const isActive = clue.clue_id === activeClueId;
            return (
              <div
                key={clue.clue_id}
                className={`clue-card ${isActive ? "clue-card--active" : ""}`}
                onClick={() => onSelectClue(clue)}
              >
                <div className="clue-card-header">
                  <span className="clue-badge">CLUE #{idx + 1}</span>
                  <span className="clue-timecode">TIMESTAMP: {formatTimecode(clue.timestamp_sec)}</span>
                  <span className="clue-coords">
                    <Crosshair size={12} />
                    <span>[{clue.bounding_box_2d.join(", ")}]</span>
                  </span>
                </div>
                <h4 className="clue-observation">{clue.observation}</h4>
                <p className="clue-narration">"{clue.narration_line}"</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
