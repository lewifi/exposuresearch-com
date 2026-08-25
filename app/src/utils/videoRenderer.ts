import type { ForensicInvestigationResult } from "../types/forensics";
import { calculateCameraTarget } from "./coordinates";

export interface RenderVideoOptions {
  imageDataUrl: string;
  result: ForensicInvestigationResult;
  width?: number;
  height?: number;
  onProgress?: (percent: number) => void;
}

/**
 * Client-Side Canvas Video Exporter
 * Renders 60fps Ken Burns pan/zoom frames + burned-in subtitles into a WebM / MP4 video Blob.
 */
export async function renderKenBurnsVideo(options: RenderVideoOptions): Promise<Blob> {
  const {
    imageDataUrl,
    result,
    width = 1080,
    height = 1920,
    onProgress
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Unable to create canvas 2D rendering context"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageDataUrl;

    img.onload = () => {
      const stream = canvas.captureStream(30); // 30fps stream
      const mimeType = MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : "video/webm;codecs=vp9";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6000000 // 6 Mbps high quality
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: mimeType });
        resolve(videoBlob);
      };

      recorder.start();

      const totalDurationSec = result.total_duration_sec || 18;
      const totalFrames = totalDurationSec * 30;
      let currentFrame = 0;

      const clues = result.clues;

      const renderFrame = () => {
        const currentTimeSec = (currentFrame / 30);

        // Find active clue
        let activeClue = clues[0];
        for (let i = 0; i < clues.length; i++) {
          if (currentTimeSec >= clues[i].timestamp_sec) {
            activeClue = clues[i];
          }
        }

        const target = calculateCameraTarget(
          activeClue.bounding_box_2d,
          activeClue.zoom_depth || 2.2
        );

        // Clear canvas
        ctx.fillStyle = "#0a0c10";
        ctx.fillRect(0, 0, width, height);

        // Draw Ken Burns transformed image
        ctx.save();
        const originX = (target.x / 100) * width;
        const originY = (target.y / 100) * height;

        ctx.translate(originX, originY);
        ctx.scale(target.scale, target.scale);
        ctx.translate(-originX, -originY);

        // Cover aspect fill
        const hRatio = width / img.width;
        const vRatio = height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (width - img.width * ratio) / 2;
        const centerShiftY = (height - img.height * ratio) / 2;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
        ctx.restore();

        // Draw Vignette
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.3,
          width / 2,
          height / 2,
          width * 0.8
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.75)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Watermark Header
        ctx.fillStyle = "rgba(10, 12, 16, 0.85)";
        ctx.fillRect(60, 80, 420, 56);
        ctx.strokeStyle = "rgba(200, 157, 124, 0.4)";
        ctx.strokeRect(60, 80, 420, 56);

        ctx.fillStyle = "#C89D7C";
        ctx.font = "bold 24px Archivo, sans-serif";
        ctx.fillText("EXPOSE FORENSICS", 90, 116);

        // Burned-in Subtitles
        if (activeClue.narration_line) {
          const subText = `"${activeClue.narration_line}"`;
          ctx.fillStyle = "rgba(10, 12, 16, 0.9)";
          ctx.roundRect(80, height - 320, width - 160, 160, [16]);
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "italic 36px 'Playfair Display', Georgia, serif";
          ctx.textAlign = "center";

          // Wrap text helper
          const maxTextWidth = width - 240;
          const words = subText.split(" ");
          let line = "";
          let y = height - 240;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextWidth && n > 0) {
              ctx.fillText(line, width / 2, y);
              line = words[n] + " ";
              y += 48;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, width / 2, y);
          ctx.textAlign = "start";
        }

        currentFrame++;
        const percent = Math.round((currentFrame / totalFrames) * 100);
        if (onProgress) onProgress(Math.min(100, percent));

        if (currentFrame < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          recorder.stop();
        }
      };

      renderFrame();
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for video rendering"));
    };
  });
}
