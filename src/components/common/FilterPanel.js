import React from 'react';
import { Card } from 'react-bootstrap';

const FilterPanel = ({ title = 'Filters', children }) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body>
      <h5 className="card-title mb-3">{title}</h5>
      {children}
    </Card.Body>
  </Card>
);

export default FilterPanel;
