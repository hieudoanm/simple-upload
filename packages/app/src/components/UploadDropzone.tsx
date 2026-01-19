import { FC, RefObject, useRef } from 'react';

interface UploadDropzoneProps {
  inputRef: RefObject<HTMLInputElement | null>;
  uploading: boolean;
  progress: number;
  success: boolean;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  onFiles: (files: FileList | null) => void;
}

export const UploadDropzone: FC<UploadDropzoneProps> = ({
  inputRef,
  uploading,
  progress,
  success,
  dragging,
  setDragging,
  onFiles,
}) => {
  const dragCounter = useRef(0);

  let statusText = '📤 Drag & drop files here';
  if (uploading) {
    statusText = '⏳ Uploading…';
  } else if (success) {
    statusText = '✅ Upload complete';
  }

  return (
    <button
      type="button"
      disabled={uploading}
      className={`rounded-box w-full max-w-xl border-2 border-dashed p-10 text-center transition ${
        dragging ? 'border-primary bg-primary/10' : 'border-base-content'
      }`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current += 1;
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
          setDragging(false);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}>
      <input
        ref={inputRef}
        id="file-upload"
        type="file"
        multiple
        disabled={uploading}
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      <p className="text-lg font-medium">{statusText}</p>
      <p className="mt-2 text-sm opacity-70">or click to select files</p>

      {uploading && <p className="mt-4 text-sm">📈 Progress: {progress}%</p>}
    </button>
  );
};
