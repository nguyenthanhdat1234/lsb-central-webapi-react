import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';

const KPIInput = ({ kpiValues, onKPIChange }) => {
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>KPI Targets</Card.Title>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Impressions Target</Form.Label>
              <Form.Control
                type="number"
                className="border"
                value={kpiValues.impressions}
                onChange={(e) => onKPIChange('impressions', e.target.value)}
                placeholder="Enter impressions target"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Spend Target ($)</Form.Label>
              <Form.Control
                type="number"
                className="border"
                value={kpiValues.spend}
                onChange={(e) => onKPIChange('spend', e.target.value)}
                placeholder="Enter spend target"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Sales Target ($)</Form.Label>
              <Form.Control
                type="number"
                className="border"
                value={kpiValues.sales}
                onChange={(e) => onKPIChange('sales', e.target.value)}
                placeholder="Enter sales target"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default KPIInput;
