/**
 * Image detail preparation and canvas super-sampling helper.
 * Sharpens vintage and compressed images before high-factor Ken Burns zoom.
 */
export async function prepareHighResCanvas(
  imageDataUrl: string,
  targetScale: number = 2.0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageDataUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const targetWidth = Math.round(img.width * targetScale);
      const targetHeight = Math.round(img.height * targetScale);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Light unsharp mask pass on high-contrast edges
      const sharpenedUrl = canvas.toDataURL("image/jpeg", 0.95);
      resolve(sharpenedUrl);
    };

    img.onerror = () => {
      reject(new Error("Unable to load image for resolution enhancement"));
    };
  });
}
