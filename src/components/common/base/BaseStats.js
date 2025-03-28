import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
  // ...existing StatCard code...
);

const BaseStats = ({ stats, items }) => (
  <Row className="g-3 mb-4">
    {items.map((item, index) => (
      <StatCard
        key={index}
        title={item.title}
        value={item.formatter(stats[item.key])}
        color={item.color}
        icon={item.icon}
        trend={stats[`${item.key}Trend`]}
      />
    ))}
  </Row>
);

export default BaseStats;
