import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const iconMap = {
    error: <AlertCircle size={20} className="alert-icon error-icon" />,
    success: <CheckCircle2 size={20} className="alert-icon success-icon" />,
    info: <Info size={20} className="alert-icon info-icon" />
  };

  return (
    <div className={`alert-banner alert-${type}`}>
      <div className="alert-content">
        {iconMap[type] || iconMap.info}
        <span className="alert-text">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="alert-close-btn"
          aria-label="Dismiss message"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
