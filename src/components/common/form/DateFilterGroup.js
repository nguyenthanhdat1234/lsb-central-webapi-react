import React from 'react';
import { Form } from 'react-bootstrap';
import DateRangePicker from '../DateRangePicker';

const DateFilterGroup = ({ label = 'Date Range', dateRange, onDateChange, className = '' }) => (
  <Form.Group className={className}>
    <Form.Label className="fw-medium">{label}</Form.Label>
    <DateRangePicker 
      dateRange={dateRange}
      onDateChange={onDateChange}
    />
  </Form.Group>
);

export default DateFilterGroup;
