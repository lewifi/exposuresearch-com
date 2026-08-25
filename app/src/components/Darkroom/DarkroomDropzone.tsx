import React from "react";
import "./DarkroomDropzone.css";

interface DarkroomDropzoneProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  isScanning?: boolean;
}

export const DarkroomDropzone: React.FC<DarkroomDropzoneProps> = ({ onImageSelected, isScanning }) => {
  return (
    <div className="darkroom-dropzone-container" onClick={() => onImageSelected && onImageSelected(new File([], "placeholder"), "")}>
      <span>{isScanning ? "Scanning..." : "Select File"}</span>
    </div>
  );
};
