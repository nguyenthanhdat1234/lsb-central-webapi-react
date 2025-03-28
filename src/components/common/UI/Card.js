import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';

const Card = ({ children, className = '', ...props }) => (
  <BootstrapCard className={`border-0 shadow-sm ${className}`} {...props}>
    {children}
  </BootstrapCard>
);

export default Card;
