import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, Upload, Film, AlertCircle } from "lucide-react";
import { SAMPLE_DOSSIERS } from "../data/sampleDossiers";
import type { SampleDossier } from "../data/sampleDossiers";
import "./CameraViewfinder.css";

interface CameraViewfinderProps {
  onCapture: (imageDataUrl: string, sampleData?: SampleDossier) => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isShutterActive, setIsShutterActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
      }
    } catch {
      setHasCamera(false);
      setCameraError("Camera access unavailable or declined. You can select an archival preset or upload a file.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onCapture(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onCapture(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleDossier) => {
    onCapture(sample.imageUrl, sample);
  };

  return (
    <div className="camera-viewfinder-root">
      <div className={`camera-stage ${isShutterActive ? "shutter-flash" : ""}`}>
        <video
          ref={videoRef}
          className="camera-video-feed"
          playsInline
          autoPlay
          muted
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Viewfinder HUD Overlays */}
        <div className="viewfinder-hud">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />
          <div className="hud-crosshair" />
          
          <div className="hud-status-bar">
            <span className="hud-tag">LENS: 35MM EQUIV</span>
            <span className="hud-tag hud-tag--rec">
              <span className="rec-dot" /> LIVE FEED
            </span>
            <span className="hud-tag">ISO 400</span>
          </div>
        </div>

        {cameraError && (
          <div className="camera-fallback-overlay">
            <AlertCircle size={28} className="fallback-icon" />
            <p className="fallback-message">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Primary Capture Controls */}
      <div className="camera-controls-bar">
        <button
          type="button"
          className="btn-control-secondary"
          onClick={() => fileInputRef.current?.click()}
          title="Upload image from device"
        >
          <Upload size={18} />
          <span>Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <button
          type="button"
          className="btn-shutter-primary"
          onClick={handleCapture}
          disabled={!hasCamera}
          title="Capture photo"
        >
          <div className="shutter-inner-ring">
            <Camera size={26} />
          </div>
        </button>

        <button
          type="button"
          className="btn-control-secondary"
          onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))}
          title="Flip camera"
        >
          <RefreshCw size={18} />
          <span>Flip</span>
        </button>
      </div>

      {/* Preset Archival Evidence Selector */}
      <div className="sample-archive-section">
        <div className="archive-header">
          <Film size={16} className="archive-icon" />
          <span className="archive-title">Or investigate an archival case file:</span>
        </div>
        <div className="sample-cards-grid">
          {SAMPLE_DOSSIERS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="sample-case-card"
              onClick={() => handleSelectSample(sample)}
            >
              <div className="sample-thumbnail-wrap">
                <img src={sample.imageUrl} alt={sample.title} className="sample-thumb" />
                <span className="sample-badge">{sample.result.era_estimate}</span>
              </div>
              <div className="sample-info">
                <h4 className="sample-name">{sample.title}</h4>
                <p className="sample-meta">{sample.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
