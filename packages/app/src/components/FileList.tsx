import { FC } from 'react';

export const FileList: FC<{ files: File[] }> = ({ files }) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-6 text-left">
      <p className="mb-2 font-semibold">🗂 Selected files:</p>
      <ul className="list-inside list-disc text-sm">
        {files.map((file) => (
          <li key={file.name}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};
