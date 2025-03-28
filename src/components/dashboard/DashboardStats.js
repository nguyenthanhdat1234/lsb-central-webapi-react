import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const StatCard = ({ icon, title, value, color }) => (
  <Col md={3} sm={6}>
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="d-flex align-items-center">
        <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 me-3`}>
          {icon}
        </div>
        <div>
          <h6 className="text-muted mb-1">{title}</h6>
          <h3 className="mb-0 fw-bold">{value}</h3>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const DashboardStats = ({ data }) => {
  if (!data) return null;

  return (
    <Row className="g-3 mb-4">
      <StatCard
        title="Total Impressions"
        value={data.impressions.toLocaleString()}
        color="primary"
        icon={<ImpressionsIcon />}
      />
      <StatCard
        title="Total Spend"
        value={`$${data.spend.toFixed(2)}`}
        color="success"
        icon={<SpendIcon />}
      />
      <StatCard
        title="Total Sales"
        value={`$${data.sales.toFixed(2)}`}
        color="info"
        icon={<SalesIcon />}
      />
      <StatCard
        title="ROI"
        value={`${((data.sales / data.spend) * 100).toFixed(2)}%`}
        color="warning"
        icon={<ROIIcon />}
      />
    </Row>
  );
};

const ImpressionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
    <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2z"/>
  </svg>
);

// ...other icon components...

export default DashboardStats;
