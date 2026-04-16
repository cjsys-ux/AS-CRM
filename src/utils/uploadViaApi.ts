export interface UploadResult {
  key: string;
  fileUrl: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Vercel serverless functions cap request bodies at ~4.5 MB. Base64 inflates
// payloads ~33%, so we warn once the raw file clears ~3.3 MB even though the
// request *might* still squeak through.
const SOFT_SIZE_LIMIT_BYTES = 3.3 * 1024 * 1024;

export async function uploadFileViaApi(
  file: File,
  entityType: string,
  entityId: string | undefined,
): Promise<UploadResult> {
  const fileData = await fileToBase64(file);
  const res = await fetch('/api/files/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      entityType,
      entityId: entityId ?? 'unknown',
      fileData,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const serverMsg = data.error || res.statusText || 'Failed to upload file.';
    const sizeHint =
      file.size > SOFT_SIZE_LIMIT_BYTES
        ? ` (file is ${(file.size / (1024 * 1024)).toFixed(1)} MB; server limit ~4.5 MB)`
        : '';
    throw new Error(`${file.name}: ${res.status} ${serverMsg}${sizeHint}`);
  }
  return res.json();
}

export async function recordUpload(params: {
  key: string;
  fileName: string;
  fileType: string;
  size: number;
  entityType: string;
  entityId: string | undefined;
  uploadedBy?: string;
}): Promise<void> {
  const res = await fetch('/api/files/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      entityId: params.entityId ?? 'unknown',
      uploadedBy: params.uploadedBy ?? 'User',
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to record upload (${res.status}).`);
  }
}
