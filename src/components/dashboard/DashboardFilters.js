import React from 'react';
import { Card, Form } from 'react-bootstrap';
import DateRangePicker from '../common/DateRangePicker';

const DashboardFilters = ({ campaigns, selectedCampaign, onCampaignChange, dateRange, onDateChange }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <h5 className="card-title mb-3">Filter Options</h5>
        <Form.Group className="mb-3">
          <Form.Label className="fw-medium">Campaign</Form.Label>
          <Form.Select 
            className="border rounded"
            value={selectedCampaign}
            onChange={(e) => onCampaignChange(e.target.value)}
          >
            {campaigns.map(campaign => (
              <option key={campaign} value={campaign}>
                {campaign === 'All' ? 'All Campaigns' : campaign}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group>
          <Form.Label className="fw-medium">Date Range</Form.Label>
          <DateRangePicker 
            dateRange={dateRange} 
            onDateChange={onDateChange}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default DashboardFilters;
