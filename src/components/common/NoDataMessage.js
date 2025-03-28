import React from 'react';
import { Alert } from 'react-bootstrap';

const NoDataMessage = ({ 
  title = 'No data available', 
  message = 'Try adjusting your filter criteria',
  icon,
  variant = 'info'
}) => (
  <Alert variant={variant} className="border-0 bg-light border-start border-5">
    <div className="d-flex align-items-center">
      <div className="me-3">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        )}
      </div>
      <div>
        <h6 className="mb-1">{title}</h6>
        <p className="mb-0 text-muted">{message}</p>
      </div>
    </div>
  </Alert>
);

export default NoDataMessage;
