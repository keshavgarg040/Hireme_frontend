import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const ToastNotification: React.FC<ToastProps> = ({
  type,
  message,
  show,
  onClose,
  autoClose = true,
  autoCloseTime = 3000
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (show && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, autoClose, autoCloseTime, onClose]);

  if (!show) return null;

  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      case 'info':
        return 'bg-info';
      default:
        return 'bg-primary';
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle size={20} />;
      case 'error':
        return <FaTimesCircle size={20} />;
      case 'warning':
        return <FaExclamationCircle size={20} />;
      case 'info':
        return <FaInfoCircle size={20} />;
      default:
        return <FaInfoCircle size={20} />;
    }
  };

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
      <div 
        className={`toast show ${getToastClass()} text-white`}
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
      >
        <div className="toast-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="me-2">{getToastIcon()}</span>
            <strong className="me-auto">Notification</strong>
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        <div className="toast-body">
          {message}
        </div>
      </div>
    </div>
  );
};

export default ToastNotification; 