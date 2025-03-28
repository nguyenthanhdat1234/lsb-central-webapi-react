import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingState = () => (
  <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
    <div className="text-center">
      <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      <p className="mt-3 text-muted">Loading campaign data...</p>
    </div>
  </div>
);

export default LoadingState;
