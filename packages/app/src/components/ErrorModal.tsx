import { FC } from 'react';

export const ErrorModal: FC<{
  error: string | null;
  onClose: () => void;
}> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-error text-lg font-bold">❌ Upload failed</h3>
        <p className="py-4">{error}</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} />
      </form>
    </dialog>
  );
};
