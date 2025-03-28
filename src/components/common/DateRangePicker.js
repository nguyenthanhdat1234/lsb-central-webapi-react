import React from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Calendar } from 'react-bootstrap-icons';

const DateRangePicker = ({ dateRange, onDateChange }) => (
  <Form.Group>
    {/* <Form.Label style={{ fontWeight: 'bold' }}>Date Range</Form.Label> */}
    <Row>
      <Col xs={12} md={6} className="pe-md-1">
        <InputGroup>
          <Form.Control
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })}
          />
          <InputGroup.Text className="text-white border-0" style={{ background: 'transparent' }}>
            <Calendar />
          </InputGroup.Text>
        </InputGroup>
      </Col>
      <Col xs={12} md={6} className="ps-md-1">
        <InputGroup>
          <Form.Control
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })}
          />
          <InputGroup.Text className="text-white border-0" style={{ background: 'transparent' }}>
            <Calendar />
          </InputGroup.Text>
        </InputGroup>
      </Col>
    </Row>
  </Form.Group>
);

export default DateRangePicker;
