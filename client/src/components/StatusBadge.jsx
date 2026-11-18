import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();

  const config = {
    pending: {
      label: 'Pending',
      className: 'badge-pending',
      icon: Clock
    },
    confirmed: {
      label: 'Confirmed',
      className: 'badge-confirmed',
      icon: CheckCircle
    },
    completed: {
      label: 'Completed',
      className: 'badge-completed',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Cancelled',
      className: 'badge-cancelled',
      icon: XCircle
    },
    rejected: {
      label: 'Declined',
      className: 'badge-rejected',
      icon: AlertTriangle
    }
  };

  const current = config[norm] || {
    label: status,
    className: 'badge-default',
    icon: Clock
  };

  const Icon = current.icon;

  return (
    <span className={`status-badge ${current.className}`}>
      <Icon size={13} className="badge-icon" />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
