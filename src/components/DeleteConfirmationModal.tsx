import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DeleteConfirmationModalProps {
  show: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  title,
  message,
  itemName,
  onConfirm,
  onCancel
}) => {
  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title d-flex align-items-center">
              <FaExclamationTriangle className="me-2" /> {title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onCancel}
            />
          </div>
          <div className="modal-body py-4">
            <p>{message}</p>
            {itemName && (
              <p className="fw-bold text-center py-2 border-bottom border-top my-2">"{itemName}"</p>
            )}
            <p className="text-danger mb-0 mt-3 fw-bold">This action cannot be undone.</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 