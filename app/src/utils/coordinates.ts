import type { CameraCoordinate } from "../types/forensics";

/**
 * Calculates the center point and zoom transform for a normalized 0-1000 bounding box.
 * @param box [ymin, xmin, ymax, xmax] normalized 0-1000
 * @param zoomScale Target zoom scale (e.g. 2.0)
 */
export function calculateCameraTarget(
  box: [number, number, number, number],
  zoomScale: number = 2.0
): CameraCoordinate {
  const [ymin, xmin, ymax, xmax] = box;
  const centerX = (xmin + xmax) / 2 / 10; // convert 0-1000 to percentage 0-100
  const centerY = (ymin + ymax) / 2 / 10; // convert 0-1000 to percentage 0-100

  return {
    x: Math.max(10, Math.min(90, centerX)),
    y: Math.max(10, Math.min(90, centerY)),
    scale: zoomScale
  };
}

/**
 * Converts a normalized 0-1000 bounding box into CSS-ready percentages for an
 * overlay that lives in the SAME transformed layer as the image (so it zooms with
 * the Ken Burns camera and frames the exact detail Gemini flagged).
 * @param box [ymin, xmin, ymax, xmax] normalized 0-1000
 */
export function getBoundingBoxRect(
  box: [number, number, number, number]
): { left: number; top: number; width: number; height: number } {
  const [ymin, xmin, ymax, xmax] = box;
  return {
    left: xmin / 10,
    top: ymin / 10,
    width: (xmax - xmin) / 10,
    height: (ymax - ymin) / 10
  };
}

/**
 * Computes CSS transform-origin and scale for smooth hardware-accelerated Ken Burns glide
 */
export function getKenBurnsTransformStyle(target: CameraCoordinate): React.CSSProperties {
  return {
    transformOrigin: `${target.x}% ${target.y}%`,
    transform: `scale(${target.scale})`,
    transition: "transform 4.5s cubic-bezier(0.25, 1, 0.5, 1), transform-origin 4.5s cubic-bezier(0.25, 1, 0.5, 1)"
  };
}
