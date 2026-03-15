import { FC } from 'react';

export const SuccessModal: FC<{
  success: { count: number; filenames: string[] } | null;
  onClose: () => void;
}> = ({ success, onClose }) => {
  if (!success) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-success text-lg font-bold">🎉 Upload successful</h3>

        <p className="py-2">
          {success.count} file{success.count > 1 ? 's' : ''} uploaded.
        </p>

        <ul className="list-inside list-disc text-sm opacity-80">
          {success.filenames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>

        <div className="modal-action">
          <button className="btn btn-success" onClick={onClose}>
            Done
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} />
      </form>
    </dialog>
  );
};
