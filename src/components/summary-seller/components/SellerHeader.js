import React from 'react';
import { Card } from 'react-bootstrap';
import { formatDate } from '../../../utils/dateUtils';

const SellerHeader = ({ title, dateRange }) => (
  <Card className="border-0 shadow-sm mb-4">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-0">{title}</h2>
        <div className="text-muted">
          <i className="bi bi-calendar3 me-2"></i>
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default SellerHeader;
