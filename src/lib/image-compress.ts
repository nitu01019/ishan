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

// Minimal bitmap-like shape that both ImageBitmap and HTMLImageElement satisfy
// when used as a drawImage source. Both expose width/height, and both are valid
// CanvasImageSource values.
interface DrawableBitmap {
  readonly width: number;
  readonly height: number;
  close?: () => void;
}

function hasOffscreenCanvas(): boolean {
  return typeof OffscreenCanvas !== 'undefined';
}

function hasCreateImageBitmap(): boolean {
  return typeof createImageBitmap === 'function';
}

/**
 * Decode a File into a drawable bitmap, preferring createImageBitmap with
 * EXIF-aware orientation when available, falling back to an HTMLImageElement
 * with img.decode() otherwise.
 */
async function decodeImage(file: File): Promise<DrawableBitmap> {
  if (hasCreateImageBitmap()) {
    // Honor EXIF orientation so rotated photos display correctly.
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    if (typeof img.decode === 'function') {
      await img.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });
    }
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    return {
      width,
      height,
      close: () => URL.revokeObjectURL(url),
      // Attach the underlying element so drawImage can use it.
      // We cast on use since the structural interface above is enough for sizing.
      ...({ _element: img } as Record<string, unknown>),
    } as DrawableBitmap & { readonly _element: HTMLImageElement };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

interface CanvasLike {
  readonly width: number;
  readonly height: number;
  drawImage(source: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
  toBlob(type: string, quality: number): Promise<Blob | null>;
}

function createCanvas(width: number, height: number): CanvasLike | null {
  if (hasOffscreenCanvas()) {
    const off = new OffscreenCanvas(width, height);
    const ctx = off.getContext('2d');
    if (!ctx) return null;
    return {
      width,
      height,
      drawImage: (source, dx, dy, dw, dh) => ctx.drawImage(source, dx, dy, dw, dh),
      toBlob: (type, quality) => off.convertToBlob({ type, quality }),
    };
  }

  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  return {
    width,
    height,
    drawImage: (source, dx, dy, dw, dh) => ctx.drawImage(source, dx, dy, dw, dh),
    toBlob: (type, quality) =>
      new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), type, quality);
      }),
  };
}

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

  const bitmap = await decodeImage(file);
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
    bitmap.close?.();
    return file;
  }

  const canvas = createCanvas(newWidth, newHeight);
  if (!canvas) {
    bitmap.close?.();
    return file;
  }

  // For the HTMLImage fallback path we stashed the element on the bitmap;
  // for createImageBitmap the bitmap itself is a valid CanvasImageSource.
  const source =
    (bitmap as unknown as { readonly _element?: HTMLImageElement })._element ??
    (bitmap as unknown as CanvasImageSource);
  canvas.drawImage(source, 0, 0, newWidth, newHeight);
  bitmap.close?.();

  // Try WebP first (25-35% smaller), fall back to JPEG
  let blob = await canvas.toBlob('image/webp', quality);
  let ext = '.webp';
  let mime = 'image/webp';

  // If WebP blob is unavailable, unsupported, or suspiciously large, fall back to JPEG
  if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) {
    blob = await canvas.toBlob('image/jpeg', quality);
    ext = '.jpg';
    mime = 'image/jpeg';
  }

  if (!blob) {
    return file;
  }

  // Only use compressed version if it's actually smaller
  if (blob.size >= file.size) {
    return file;
  }

  const compressedName = file.name.replace(/\.[^.]+$/, ext);
  return new File([blob], compressedName, { type: mime });
}
