import React from 'react';
import { Card } from 'react-bootstrap';

const PageHeader = ({ title, children }) => (
  <Card className="border-0 shadow-sm mb-4">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h2 className="mb-0">{title}</h2>
        </div>
        {children && <div>{children}</div>}
      </div>
    </Card.Body>
  </Card>
);

export default PageHeader;
