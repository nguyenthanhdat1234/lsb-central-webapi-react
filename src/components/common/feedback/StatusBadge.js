import React from 'react';
import { Badge } from 'react-bootstrap';

const getStatusColor = (status) => {
  const statusMap = {
    active: 'success',
    paused: 'warning',
    completed: 'info',
    error: 'danger',
    default: 'secondary'
  };
  return statusMap[status?.toLowerCase()] || statusMap.default;
};

const StatusBadge = ({ status, className = '' }) => {
  const color = getStatusColor(status);
  
  return (
    <Badge 
      bg={`${color}-subtle`} 
      text={color}
      className={`px-3 py-2 ${className}`}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
