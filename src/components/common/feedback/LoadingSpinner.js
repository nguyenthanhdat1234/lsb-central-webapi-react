import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ text = 'Loading...', size = '3rem' }) => (
  <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
    <div className="text-center">
      <Spinner 
        animation="border" 
        role="status" 
        variant="primary" 
        style={{ width: size, height: size }}
      />
      <p className="mt-3 text-muted">{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;
