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
