'use client';

/**
 * Client-side image compression using Canvas.
 * Resizes large images and compresses to WebP (25-35% smaller than JPEG).
 * Falls back to JPEG if WebP is not supported.
 */

export interface CompressOptions {
  /** Max width in pixels (default: 1280) */
  readonly maxWidth?: number;
  /** Max height in pixels (default: 720) */
  readonly maxHeight?: number;
  /** Quality 0-1 (default: 0.85) */
  readonly quality?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1280,
  maxHeight: 720,
  quality: 0.85,
};

export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  // Only compress image types
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip small images (< 200KB)
  if (file.size < 200 * 1024) {
    return file;
  }

  const { maxWidth, maxHeight, quality } = { ...DEFAULTS, ...options };

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Calculate new dimensions maintaining aspect ratio
  let newWidth = width;
  let newHeight = height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  } else if (file.size < 500 * 1024) {
    // Image is already small and within dimensions — skip compression
    bitmap.close();
    return file;
  }

  const canvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  // Try WebP first (25-35% smaller), fall back to JPEG
  let blob = await canvas.convertToBlob({ type: 'image/webp', quality });
  let ext = '.webp';
  let mime = 'image/webp';

  // If WebP blob is suspiciously large or unsupported, fall back to JPEG
  if (blob.type !== 'image/webp' || blob.size >= file.size) {
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    ext = '.jpg';
    mime = 'image/jpeg';
  }

  // Only use compressed version if it's actually smaller
  if (blob.size >= file.size) {
    return file;
  }

  const compressedName = file.name.replace(/\.[^.]+$/, ext);
  return new File([blob], compressedName, { type: mime });
}
