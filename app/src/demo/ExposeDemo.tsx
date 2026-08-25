import React, { useState } from "react";
import { Camera, Sparkles, Menu, ShieldAlert, Cpu } from "lucide-react";
import { CameraViewfinder } from "./components/CameraViewfinder";
import { ForensicScanner } from "./components/ForensicScanner";
import { InteractiveKenBurns } from "./components/InteractiveKenBurns";
import { EvidenceDossier } from "./components/EvidenceDossier";
import { ExportModal } from "./components/ExportModal";
import { SAMPLE_DOSSIERS } from "./data/sampleDossiers";
import type { SampleDossier } from "./data/sampleDossiers";
import type { ForensicInvestigationResult, ForensicClue } from "../types/forensics";
import "./ExposeDemo.css";

import { analyzePhotoWithGemini } from "../services/gemini";

type DemoStage = "capture" | "scanning" | "investigation";

export const ExposeDemo: React.FC = () => {
  const [stage, setStage] = useState<DemoStage>("capture");
  const [activeImage, setActiveImage] = useState<string>(SAMPLE_DOSSIERS[0].imageUrl);
  const [currentResult, setCurrentResult] = useState<ForensicInvestigationResult>(SAMPLE_DOSSIERS[0].result);
  const [activeClueId, setActiveClueId] = useState<string>(SAMPLE_DOSSIERS[0].result.clues[0].clue_id);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [narrativeMode, setNarrativeMode] = useState<"detective" | "storyteller" | "archivist">("detective");

  const handleCaptureImage = async (imageDataUrl: string, sampleData?: SampleDossier) => {
    setActiveImage(imageDataUrl);
    setStage("scanning");

    if (sampleData) {
      setCurrentResult({
        ...sampleData.result,
        narrative_mode: narrativeMode
      });
      setActiveClueId(sampleData.result.clues[0].clue_id);
      return;
    }

    try {
      // Attempt live Gemini 3.1 Flash-Lite API inference if key is present
      const liveResult = await analyzePhotoWithGemini(imageDataUrl, narrativeMode);
      setCurrentResult(liveResult);
      if (liveResult.clues && liveResult.clues.length > 0) {
        setActiveClueId(liveResult.clues[0].clue_id);
      }
    } catch {
      // Clean fallback if API key not yet configured in .env
      const dynamicClues: ForensicClue[] = [
        {
          clue_id: "user-clue-1",
          timestamp_sec: 0,
          observation: "Primary subject focal geometry and ambient light vector",
          bounding_box_2d: [180, 220, 550, 680],
          zoom_depth: 2.1,
          narration_line: "The sensor caught the subject in sharp contrast against the background."
        },
        {
          clue_id: "user-clue-2",
          timestamp_sec: 6,
          observation: "Perimeter surface texture and chromatic anomaly",
          bounding_box_2d: [580, 140, 840, 480],
          zoom_depth: 2.4,
          narration_line: "Subtle edge anomalies indicated an unplanned movement seconds prior to exposure."
        },
        {
          clue_id: "user-clue-3",
          timestamp_sec: 12,
          observation: "High-frequency reflective highlight on the lower plane",
          bounding_box_2d: [480, 610, 780, 920],
          zoom_depth: 2.2,
          narration_line: "A single reflective trace anchored the composition to the exact moment of capture."
        }
      ];

      setCurrentResult({
        story_title: "Subject Examination Log",
        era_estimate: "Contemporary Capture",
        contextual_mood_tags: ["High Contrast", "Optic Flare", "Direct Investigation", "Uncalibrated Scene"],
        ambient_sound_profile: "tape_hiss_polaroid",
        total_duration_sec: 18,
        narrative_mode: narrativeMode,
        clues: dynamicClues
      });
      setActiveClueId("user-clue-1");
    }
  };

  const handleScanFinished = () => {
    setStage("investigation");
  };

  const handleReset = () => {
    setStage("capture");
  };

  const handleClueSelect = (clue: ForensicClue) => {
    setActiveClueId(clue.clue_id);
  };

  return (
    <div className="expose-demo-container">
      {/* Editorial Top Navigation Header */}
      <header className="expose-header">
        <div className="header-left">
          <button type="button" className="btn-hamburger" title="Navigation Menu">
            <Menu size={20} />
          </button>
          <div className="brand-lockup">
            <h1 className="brand-title">
              Expose <span className="copper-ampersand">&</span> Forensics
            </h1>
            <span className="brand-badge">MULTIMODAL DISCOVERY</span>
          </div>
        </div>

        {/* Narrative Mode Selection Chips in Header */}
        <div className="header-mode-chips">
          <button
            type="button"
            className={`chip-mode ${narrativeMode === "detective" ? "chip-mode--active" : ""}`}
            onClick={() => setNarrativeMode("detective")}
          >
            <ShieldAlert size={14} />
            <span>Noir Detective</span>
          </button>

          <button
            type="button"
            className={`chip-mode ${narrativeMode === "archivist" ? "chip-mode--active" : ""}`}
            onClick={() => setNarrativeMode("archivist")}
          >
            <Cpu size={14} />
            <span>Archivist</span>
          </button>

          <button
            type="button"
            className={`chip-mode ${narrativeMode === "storyteller" ? "chip-mode--active" : ""}`}
            onClick={() => setNarrativeMode("storyteller")}
          >
            <Sparkles size={14} />
            <span>Storyteller</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="expose-main-stage">
        {stage === "capture" && (
          <section className="stage-section stage-capture">
            <div className="stage-intro">
              <div className="intro-badge">
                <Camera size={14} />
                <span>STEP 01: PHOTO INGESTION</span>
              </div>
              <h2 className="section-headline">
                Point, Capture, <span className="copper-ampersand">&</span> Investigate
              </h2>
              <p className="section-description">
                Use your camera to frame any photograph or document. Our Gemini 3.1 Flash-Lite forensics engine
                extracts micro-evidence, assigns coordinate bounding boxes, and generates an atmospheric Ken Burns film.
              </p>
            </div>
            <CameraViewfinder onCapture={handleCaptureImage} />
          </section>
        )}

        {stage === "scanning" && (
          <section className="stage-section stage-scanning">
            <div className="stage-intro">
              <div className="intro-badge">
                <Sparkles size={14} />
                <span>STEP 02: FORENSIC SCANNING</span>
              </div>
              <h2 className="section-headline">
                Analyzing Optical Geometry <span className="copper-ampersand">&</span> Evidence
              </h2>
            </div>
            <ForensicScanner
              imageDataUrl={activeImage}
              clues={currentResult.clues}
              eraEstimate={currentResult.era_estimate}
              moodTags={currentResult.contextual_mood_tags}
              onScanComplete={handleScanFinished}
            />
          </section>
        )}

        {stage === "investigation" && (
          <section className="stage-section stage-investigation">
            <div className="stage-intro">
              <div className="intro-badge">
                <Sparkles size={14} />
                <span>STEP 03: THE CINEMATIC DOSSIER</span>
              </div>
              <h2 className="section-headline">
                {currentResult.story_title}
              </h2>
            </div>

            <div className="investigation-split-grid">
              <InteractiveKenBurns
                imageDataUrl={activeImage}
                result={currentResult}
                onOpenExport={() => setIsExportOpen(true)}
              />

              <EvidenceDossier
                result={currentResult}
                activeClueId={activeClueId}
                onSelectClue={handleClueSelect}
                onReset={handleReset}
              />
            </div>
          </section>
        )}
      </main>

      {/* Export Simulation Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        imageDataUrl={activeImage}
        result={currentResult}
      />

      {/* Mandatory Footer with Attribution & Version Badge */}
      <footer className="expose-footer">
        <div className="footer-left">
          <span>Made lovingly by </span>
          <a
            href="https://ephix.net"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            EPHIX PULSE
          </a>
        </div>
        <div className="footer-right">
          <span className="version-badge">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};
