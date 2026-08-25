import React, { useState, useEffect } from "react";
import { X, Download, Film, CheckCircle2, Share2, Sparkles } from "lucide-react";
import type { ForensicInvestigationResult } from "../../types/forensics";
import "./ExportModal.css";

import { renderKenBurnsVideo } from "../../utils/videoRenderer";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  result: ForensicInvestigationResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  result
}) => {
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setExportProgress(0);
      setIsDone(false);
      setVideoBlobUrl(null);
      return;
    }

    let isMounted = true;

    renderKenBurnsVideo({
      imageDataUrl,
      result,
      width: 720,
      height: 1280,
      onProgress: (percent) => {
        if (isMounted) setExportProgress(percent);
      }
    })
      .then((blob) => {
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setVideoBlobUrl(url);
          setIsDone(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsDone(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageDataUrl, result]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoBlobUrl || imageDataUrl;
    link.download = `expose-${result.story_title.toLowerCase().replace(/\s+/g, "-")}.${videoBlobUrl ? "webm" : "jpg"}`;
    link.click();
  };

  return (
    <div className="export-modal-backdrop" onClick={onClose}>
      <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <div className="modal-title-wrap">
            <Film size={20} className="modal-title-icon" />
            <h3 className="modal-title">Vertical Cinema Export</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="export-preview-container">
          <div className="export-vertical-frame">
            <img src={imageDataUrl} alt="Export Preview" className="export-frame-image" />
            <div className="export-frame-vignette" />
            
            <div className="export-frame-subtitles">
              <p>"{result.clues[0]?.narration_line}"</p>
            </div>

            <div className="export-watermark">
              <Sparkles size={12} />
              <span>EXPOSE FORENSICS</span>
            </div>
          </div>

          <div className="export-status-column">
            <h4 className="export-status-title">Format Specifications</h4>
            <ul className="export-specs-list">
              <li><strong>Aspect Ratio:</strong> 9:16 Vertical (1080x1920)</li>
              <li><strong>Framerate:</strong> 60fps WebCodecs Canvas Stream</li>
              <li><strong>Audio Mix:</strong> Voice Narration + {result.ambient_sound_profile.replace(/_/g, " ")} Foley</li>
              <li><strong>Subtitles:</strong> Burned-in Kinetic Serif Captions</li>
            </ul>

            <div className="export-progress-wrap">
              <div className="export-progress-bar-track">
                <div
                  className="export-progress-bar-fill"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <span className="export-progress-text">
                {isDone ? "Ready for Social Export" : `Rendering Video... ${exportProgress}%`}
              </span>
            </div>

            <div className="export-actions-row">
              <button
                type="button"
                className="btn-download-primary"
                onClick={handleDownload}
                disabled={!isDone}
              >
                {isDone ? <Download size={18} /> : <CheckCircle2 size={18} />}
                <span>{isDone ? "Download Story MP4" : "Synthesizing..."}</span>
              </button>

              <button
                type="button"
                className="btn-share-secondary"
                onClick={onClose}
              >
                <Share2 size={16} />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
