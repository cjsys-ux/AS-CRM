/**
 * Download a saved file from S3 (via the /api/files/image proxy) or a direct URL,
 * preserving the original filename. Uses a blob + anchor so any file type (PDF,
 * Excel, PowerPoint, images, text, etc.) is saved rather than previewed inline.
 */
export async function downloadSavedFile(file: {
  key?: string;
  fileUrl?: string;
  fileName?: string;
}): Promise<void> {
  const url = file.key
    ? `/api/files/image?key=${encodeURIComponent(file.key)}`
    : file.fileUrl;
  if (!url) throw new Error('No download URL available');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = file.fileName || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(objectUrl);
}
