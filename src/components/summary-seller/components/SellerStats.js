import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { formatCurrency } from '../../../utils/formatters';

const StatCard = ({ title, value, icon, trend }) => (
  <Col sm={6} lg={3}>
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className="mb-0">{value}</h3>
            {trend && (
              <small className={`text-${trend > 0 ? 'success' : 'danger'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </small>
            )}
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const SellerStats = ({ statistics }) => (
  <Row>
    <StatCard 
      title="Total Sales"
      value={formatCurrency(statistics.totalSales)}
      icon={<i className="bi bi-cart-check fs-4"></i>}
      trend={statistics.salesTrend}
    />
    {/* Add other stat cards */}
  </Row>
);

export default SellerStats;
