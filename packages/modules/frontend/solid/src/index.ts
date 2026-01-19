import { createSignal } from 'solid-js';

/* ---------- Simple PUT ---------- */
export const uploadPut = async (
  file: File,
  url: string,
  onProgress?: (p: number) => void
): Promise<void> => {
  onProgress?.(0);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error('PUT upload failed');
  }

  onProgress?.(100);
};

/* ---------- Signal ---------- */
export const createSimpleUpload = () => {
  const [uploading, setUploading] = createSignal(false);
  const [progress, setProgress] = createSignal(0);

  const uploadPutFile = async (file: File, url: string) => {
    setUploading(true);
    setProgress(0);

    try {
      await uploadPut(file, url, setProgress);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    progress,
    uploadPutFile,
  };
};
