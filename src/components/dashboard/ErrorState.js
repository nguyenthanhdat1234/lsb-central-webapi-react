import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorState = ({ error }) => (
  <Alert variant="danger" className="m-4 shadow-sm">
    <div className="d-flex align-items-center">
      <div className="me-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div>
        <h5 className="mb-1">Error Loading Dashboard</h5>
        <p className="mb-0">{error}</p>
      </div>
    </div>
  </Alert>
);

export default ErrorState;
