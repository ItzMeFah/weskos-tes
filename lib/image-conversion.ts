const MAX_IMAGE_DIMENSION = 1800;
const WEBP_QUALITY = 0.82;

export async function convertImageToWebP(file: File): Promise<File> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("Choose an image file to upload.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image format cannot be opened by this browser. Try JPEG, PNG, WebP, GIF, or AVIF.");
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / bitmap.width, MAX_IMAGE_DIMENSION / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare this image for upload.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not convert this image to WebP.")), "image/webp", WEBP_QUALITY);
    });
    if (blob.type !== "image/webp") throw new Error("This browser cannot encode WebP images.");
    const nameWithoutExtension = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${nameWithoutExtension}.webp`, { type: "image/webp", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

/** Converts a logo to WebP and removes a near-white background while keeping antialiased edges. */
export async function convertLogoToTransparentWebP(file: File): Promise<File> {
  if (file.type && !file.type.startsWith("image/")) throw new Error("Choose an image file to upload as the logo.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This logo format cannot be opened by this browser. Try JPEG, PNG, or WebP.");
  }

  try {
    const scale = Math.min(1, 2048 / bitmap.width, 2048 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Could not prepare this logo for upload.");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = image.data;
    let sourceHasTransparency = false;
    for (let offset = 3; offset < pixels.length; offset += 4) {
      if (pixels[offset] < 255) { sourceHasTransparency = true; break; }
    }
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const alpha = pixels[offset + 3] / 255;
      if (alpha === 0) continue;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightness = Math.max(red, green, blue);
      const chroma = brightness - Math.min(red, green, blue);
      if (!sourceHasTransparency && brightness > 200 && chroma < 48) {
        const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        const foregroundAlpha = Math.max(0, Math.min(1, (255 - luminance) / 180));
        pixels[offset + 3] = Math.round(255 * alpha * foregroundAlpha);
      }
      // Store a dark monochrome mark. The site can then invert it to white in dark mode.
      if (pixels[offset + 3] > 0) {
        pixels[offset] = 0;
        pixels[offset + 1] = 0;
        pixels[offset + 2] = 0;
      }
    }
    context.putImageData(image, 0, 0);
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 16) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    if (maxX < minX || maxY < minY) throw new Error("No visible logo remains after removing its light background. Try an image with a darker logo.");
    const padding = Math.max(2, Math.round(Math.max(maxX - minX + 1, maxY - minY + 1) * 0.04));
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.min(canvas.width - cropX, maxX - minX + 1 + padding * 2);
    const cropHeight = Math.min(canvas.height - cropY, maxY - minY + 1 + padding * 2);
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedContext = croppedCanvas.getContext("2d");
    if (!croppedContext) throw new Error("Could not finish preparing this logo.");
    croppedContext.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    const blob = await new Promise<Blob>((resolve, reject) => {
      croppedCanvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not convert this logo to transparent WebP.")), "image/webp", 0.96);
    });
    if (blob.type !== "image/webp") throw new Error("This browser cannot encode WebP images.");
    const nameWithoutExtension = file.name.replace(/\.[^.]+$/, "") || "weskos-logo";
    return new File([blob], `${nameWithoutExtension}-transparent.webp`, { type: "image/webp", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}
