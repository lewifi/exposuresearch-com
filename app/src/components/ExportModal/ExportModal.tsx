import React from "react";
import "./ExportModal.css";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportMp4: () => Promise<void>;
  isExporting: boolean;
  progressPercent: number;
}

export const ExportModal: React.FC<ExportModalProps> = () => {
  return (
    <div className="export-modal-backdrop">
      {/* Client-side MP4 generation status, video preview, download button */}
    </div>
  );
};
