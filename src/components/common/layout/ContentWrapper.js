import React from 'react';
import { Card } from 'react-bootstrap';

const ContentWrapper = ({ 
  title, 
  children, 
  headerContent,
  className = '',
  bodyClassName = '' 
}) => (
  <Card className={`border-0 shadow-sm mb-4 ${className}`}>
    {(title || headerContent) && (
      <Card.Header className="bg-white border-0 py-3">
        <div className="d-flex justify-content-between align-items-center">
          {title && <h5 className="mb-0">{title}</h5>}
          {headerContent}
        </div>
      </Card.Header>
    )}
    <Card.Body className={bodyClassName}>
      {children}
    </Card.Body>
  </Card>
);

export default ContentWrapper;
