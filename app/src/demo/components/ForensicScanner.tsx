import React, { useEffect, useState } from "react";
import { Search, Crosshair, CheckCircle2 } from "lucide-react";
import type { ForensicClue } from "../../types/forensics";
import "./ForensicScanner.css";

interface ForensicScannerProps {
  imageDataUrl: string;
  clues: ForensicClue[];
  eraEstimate: string;
  moodTags: string[];
  onScanComplete: () => void;
}

export const ForensicScanner: React.FC<ForensicScannerProps> = ({
  imageDataUrl,
  clues,
  eraEstimate,
  moodTags,
  onScanComplete
}) => {
  const [revealedClueCount, setRevealedClueCount] = useState<number>(0);
  const [scanPhase, setScanPhase] = useState<"analyzing" | "locating" | "complete">("analyzing");

  useEffect(() => {
    // Phase 1: Laser Scan Sweep (0s - 1.2s)
    const t1 = setTimeout(() => {
      setScanPhase("locating");
    }, 1200);

    // Phase 2: Staggered Clue Tag Revelations
    const t2 = setTimeout(() => setRevealedClueCount(1), 1600);
    const t3 = setTimeout(() => setRevealedClueCount(2), 2400);
    const t4 = setTimeout(() => setRevealedClueCount(clues.length), 3200);

    // Phase 3: Transition to Ken Burns Director
    const t5 = setTimeout(() => {
      setScanPhase("complete");
      onScanComplete();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [clues.length, onScanComplete]);

  return (
    <div className="forensic-scanner-root">
      <div className="scanner-display-stage">
        <img src={imageDataUrl} alt="Forensic Subject" className="scanner-target-image" />
        
        {/* Animated Laser Scanning Line */}
        <div className="scanner-laser-line" />
        <div className="scanner-grid-overlay" />

        {/* Dynamic Bounding Boxes */}
        {clues.slice(0, revealedClueCount).map((clue, idx) => {
          const [ymin, xmin, ymax, xmax] = clue.bounding_box_2d;
          const top = `${ymin / 10}%`;
          const left = `${xmin / 10}%`;
          const width = `${(xmax - xmin) / 10}%`;
          const height = `${(ymax - ymin) / 10}%`;

          return (
            <div
              key={clue.clue_id}
              className="scanner-bounding-box"
              style={{ top, left, width, height, animationDelay: `${idx * 150}ms` }}
            >
              <div className="box-corner box-tl" />
              <div className="box-corner box-tr" />
              <div className="box-corner box-bl" />
              <div className="box-corner box-br" />
              <div className="box-tag-label">
                <span className="box-tag-id">EVIDENCE #{idx + 1}</span>
                <span className="box-tag-text">{clue.observation}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Forensic Diagnostics HUD */}
      <div className="scanner-diagnostics-panel">
        <div className="diagnostics-header">
          <Search size={18} className="diagnostics-icon" />
          <h3 className="diagnostics-title">Forensic Ingestion Pipeline</h3>
          <span className="diagnostics-badge">GEMINI 3.1 FLASH-LITE</span>
        </div>

        <div className="diagnostics-meters-grid">
          <div className="meter-card">
            <span className="meter-label">CHRONOLOGICAL ESTIMATE</span>
            <span className="meter-value">{eraEstimate || "Calibrating..."}</span>
          </div>
          <div className="meter-card">
            <span className="meter-label">EVIDENCE POINTS DETECTED</span>
            <span className="meter-value">{revealedClueCount} OF {clues.length} CLUES</span>
          </div>
        </div>

        <div className="diagnostics-mood-tags">
          <span className="mood-tags-label">CONTEXTUAL MOOD TAGS:</span>
          <div className="mood-pills-row">
            {moodTags.map((tag, i) => (
              <span key={i} className="mood-pill">
                <Crosshair size={12} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="diagnostics-status-line">
          <CheckCircle2 size={16} className="status-icon" />
          <span>
            {scanPhase === "analyzing" && "Deconstructing photometric metadata and era anomalies..."}
            {scanPhase === "locating" && "Mapping coordinate bounding boxes for Ken Burns director..."}
            {scanPhase === "complete" && "Forensic synthesis complete. Launching narrative director..."}
          </span>
        </div>
      </div>
    </div>
  );
};
