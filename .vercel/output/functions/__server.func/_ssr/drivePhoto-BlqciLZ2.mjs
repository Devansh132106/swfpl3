function extractDriveFileId(url) {
  if (!url) return null;
  const proxy = url.match(/\/api\/drive-image\/([a-zA-Z0-9_-]+)/);
  if (proxy?.[1]) return proxy[1];
  const patterns = [
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?(?:export=[^&]+&)?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/,
    /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}
function driveImageDirectUrls(fileId) {
  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://drive.google.com/uc?export=download&id=${fileId}`
  ];
}
function driveImageProxyUrl(fileId) {
  return `/api/drive-image/${fileId}`;
}
function normalizePhotoUrl(url) {
  if (!url) return "";
  const id = extractDriveFileId(url);
  if (id) return driveImageProxyUrl(id);
  return url;
}
export {
  driveImageProxyUrl as a,
  driveImageDirectUrls as d,
  extractDriveFileId as e,
  normalizePhotoUrl as n
};
