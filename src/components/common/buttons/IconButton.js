import React from 'react';
import { Button } from 'react-bootstrap';

const IconButton = ({ 
  icon, 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => (
  <Button
    variant={variant}
    size={size}
    className={`d-inline-flex align-items-center ${className}`}
    {...props}
  >
    {icon && <span className="me-2">{icon}</span>}
    {children}
  </Button>
);

export default IconButton;
