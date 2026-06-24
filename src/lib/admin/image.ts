/**
 * Client-side image optimisation for the admin uploader.
 *
 * Any image the agent drops in (raw phone JPEG/PNG/HEIC, often several MB) is
 * resized to a web-friendly dimension and re-encoded as WebP before it ever
 * leaves the browser. This keeps storage small (~300 KB/photo) and is identical
 * whether we persist to localStorage now or Supabase Storage later.
 */

/** Longest edge of the stored image, in pixels. Full-HD class — sharp on any screen, light on storage. */
export const MAX_EDGE = 1920;
/** WebP quality. 0.82 is visually lossless for photos while staying ~300 KB. */
export const WEBP_QUALITY = 0.82;

/** True if the browser can encode WebP via canvas. Universal in modern browsers; we fall back to JPEG otherwise. */
function canEncodeWebp(): boolean {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/** Load a File into an HTMLImageElement via an object URL (revoked after load). */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Nem sikerült beolvasni a képet.'));
    };
    img.src = url;
  });
}

/** Read a File straight to a data URL (fallback when canvas processing is not possible). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error('Nem sikerült beolvasni a képet.'));
    fr.readAsDataURL(file);
  });
}

/**
 * Resize (if larger than MAX_EDGE) and re-encode a single image file to a WebP
 * data URL. Falls back to JPEG if WebP is unavailable, and to the raw data URL
 * if canvas processing fails for any reason — so an upload never silently drops.
 */
export async function optimizeImage(file: File): Promise<string> {
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return fileToDataUrl(file);
    ctx.drawImage(img, 0, 0, w, h);

    const mime = canEncodeWebp() ? 'image/webp' : 'image/jpeg';
    return canvas.toDataURL(mime, WEBP_QUALITY);
  } catch {
    // HEIC or anything the browser can't decode — keep the original rather than lose it.
    return fileToDataUrl(file);
  }
}

/** Optimise many files, preserving order. */
export async function optimizeImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map(optimizeImage));
}
