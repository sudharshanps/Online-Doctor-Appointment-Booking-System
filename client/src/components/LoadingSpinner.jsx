import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading, please wait...', size = 28 }) => {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <Loader2 size={size} className="spin-icon" />
      {message && <p className="spinner-text">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
