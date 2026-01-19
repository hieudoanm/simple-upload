import { useState } from 'react';

/* ---------- Simple PUT ---------- */
export const uploadPut = async (
  file: File,
  url: string,
  onProgress?: (p: number) => void
): Promise<void> => {
  // fetch cannot track upload progress
  onProgress?.(0);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type, // MUST match presign
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error('PUT upload failed');
  }

  onProgress?.(100);
};

/* ---------- POST ---------- */
export const uploadPost = async (
  file: File,
  post: { url: string; fields: Record<string, string> }
): Promise<void> => {
  const form = new FormData();
  Object.entries(post.fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', file);

  const res = await fetch(post.url, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error('POST upload failed');
  }
};

/* ---------- Multipart ---------- */
export const uploadMultipart = async (
  file: File,
  api: {
    create: () => Promise<string>;
    signPart: (part: number) => Promise<string>;
    complete: (parts: { ETag: string; PartNumber: number }[]) => Promise<void>;
  },
  chunkSize = 5 * 1024 * 1024
): Promise<void> => {
  await api.create(); // uploadId handled server-side

  const parts: { ETag: string; PartNumber: number }[] = [];

  const totalParts = Math.ceil(file.size / chunkSize);

  await Array.from({ length: totalParts }).reduce(async (prev, _, index) => {
    await prev;

    const partNumber = index + 1;
    const start = index * chunkSize;
    const chunk = file.slice(start, start + chunkSize);
    const url = await api.signPart(partNumber);

    const res = await fetch(url, {
      method: 'PUT',
      body: chunk,
    });

    if (!res.ok) {
      throw new Error(`Multipart upload failed at part ${partNumber}`);
    }

    const etag = res.headers.get('ETag');
    if (!etag) {
      throw new Error('Missing ETag from S3');
    }

    parts.push({
      ETag: etag.replaceAll('"', ''),
      PartNumber: partNumber,
    });
  }, Promise.resolve());

  await api.complete(parts);
};

/* ---------- Hook ---------- */
export const useSimpleUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadPutFile = async (file: File, url: string) => {
    setUploading(true);
    setProgress(0);

    try {
      await uploadPut(file, url, setProgress);
    } finally {
      setUploading(false);
    }
  };

  return { uploadPutFile, uploading, progress };
};
