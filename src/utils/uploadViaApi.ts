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
    throw new Error(data.error || 'Failed to upload file.');
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
  await fetch('/api/files/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      entityId: params.entityId ?? 'unknown',
      uploadedBy: params.uploadedBy ?? 'User',
    }),
  });
}
