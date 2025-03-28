import React from 'react';
import { Card } from 'react-bootstrap';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'primary',
  formatter = (val) => val 
}) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="d-flex align-items-center">
      <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 me-3`}>
        {icon}
      </div>
      <div>
        <h6 className="text-muted mb-1">{title}</h6>
        <h3 className="mb-0 fw-bold">{formatter(value)}</h3>
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
