import React from 'react';
import { Container } from 'react-bootstrap';

const PageContainer = ({ children, fluid = true, className = '' }) => (
  <Container fluid={fluid} className={`p-4 bg-light ${className}`}>
    {children}
  </Container>
);

export default PageContainer;
