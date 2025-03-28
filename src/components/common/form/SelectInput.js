import React from 'react';
import { Form } from 'react-bootstrap';

const SelectInput = ({ 
  label,
  options = [],
  value,
  onChange,
  className = '',
  placeholder = 'Select an option'
}) => (
  <Form.Group className={className}>
    {label && <Form.Label>{label}</Form.Label>}
    <Form.Select
      value={value}
      onChange={onChange}
      className="border rounded"
    >
      <option value="">{placeholder}</option>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
);

export default SelectInput;
