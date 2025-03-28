import React from 'react';
import { Card } from 'react-bootstrap';

const StatsCard = ({ title, value, icon, trend, color = 'primary' }) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="d-flex align-items-center p-3">
      <div className={`rounded-circle bg-${color} bg-opacity-10 p-2 p-sm-3 me-3`}>
        {icon}
      </div>
      <div className="overflow-hidden">
        <h6 className="text-muted mb-1 text-truncate">{title}</h6>
        <h3 className="mb-0 fw-bold text-truncate">{value}</h3>
        {trend && (
          <small className={`text-${trend > 0 ? 'success' : 'danger'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </small>
        )}
      </div>
    </Card.Body>
  </Card>
);

export default StatsCard;
