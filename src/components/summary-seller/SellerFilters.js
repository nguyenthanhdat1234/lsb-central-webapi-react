import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import DateRangePicker from '../common/DateRangePicker';

const SellerFilters = ({ filters, onFilterChange }) => {
  return (
    <Card className="mb-4">
      <Card.Body>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Platform</Form.Label>
              <Form.Select
                value={filters.platform}
                onChange={(e) => onFilterChange({ platform: e.target.value })}
              >
                <option value="all">All Platforms</option>
                {/* Add your platform options */}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group>
              <Form.Label>Date Range</Form.Label>
              <DateRangePicker
                dateRange={filters.dateRange}
                onDateChange={(dateRange) => onFilterChange({ dateRange })}
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SellerFilters;
