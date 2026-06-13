/** Extract Google Drive file id from common share / embed URL formats. */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const proxy = url.match(/\/api\/drive-image\/([a-zA-Z0-9_-]+)/);
  if (proxy?.[1]) return proxy[1];
  const patterns = [
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?(?:export=[^&]+&)?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/,
    /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/** Direct Google URLs to try (client-side fallback). */
export function driveImageDirectUrls(fileId: string): string[] {
  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
  ];
}

/** Same-origin proxy — most reliable for <img src> with Drive files. */
export function driveImageProxyUrl(fileId: string): string {
  return `/api/drive-image/${fileId}`;
}

/** Normalize sheet photo cell → URL used in the UI. */
export function normalizePhotoUrl(url: string): string {
  if (!url) return "";
  const id = extractDriveFileId(url);
  if (id) return driveImageProxyUrl(id);
  return url;
}
