import React from 'react';
import { Container } from 'react-bootstrap';

const PageContainer = ({ children, fluid = true, className = '' }) => (
  <Container 
    fluid={fluid} 
    className={`p-2 p-sm-3 p-md-4 bg-light ${className}`}
  >
    {children}
  </Container>
);

export default PageContainer;
