import React from 'react';
import { Container } from 'react-bootstrap';

const DashboardLayout = ({ children }) => (
  <Container fluid className="p-2 p-sm-3 p-md-4 bg-light">
    {children}
  </Container>
);

export default DashboardLayout;
