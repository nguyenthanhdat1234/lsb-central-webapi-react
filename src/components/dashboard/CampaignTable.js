import React from 'react';
import { Table, Pagination, Form, InputGroup, Alert, Card } from 'react-bootstrap';

// Client lookup function - replace with your actual implementation
const getClientNameFromId = (clientId) => {
  // This should be replaced with your actual client database or API call
  const clientDatabase = {
    'CL1234': 'Acme Corporation',
    'CL5678': 'Global Industries',
    'CL9012': 'Tech Solutions Inc.',
    // Add more mappings as needed
  };
  
  return clientDatabase[clientId] || 'Unknown Client';
};

const CampaignTable = ({ data, pagination, onPageChange, onSearch }) => (
  <Card className="border-0 shadow-sm mb-4">
    <Card.Body>
      <TableHeader onSearch={onSearch} />
      {data.length > 0 ? (
        <div className="table-container">
          <div className="table-responsive">
            <Table className="table-hover campaign-table">
              <TableHead />
              <TableBody data={data} />
            </Table>
          </div>
          {pagination.totalPages > 1 && (
            <TablePagination 
              pagination={pagination}
              onPageChange={onPageChange}
            />
          )}
        </div>
      ) : (
        <NoDataAlert />
      )}
    </Card.Body>
  </Card>
);

const TableHeader = ({ onSearch }) => (
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h5 className="card-title mb-0">Campaign Details</h5>
    <TableSearch onSearch={onSearch} />
  </div>
);

const TableSearch = ({ onSearch }) => (
  <InputGroup style={{ maxWidth: '300px' }}>
    <InputGroup.Text className="bg-white border-end-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
      </svg>
    </InputGroup.Text>
    <Form.Control
      placeholder="Search campaigns..."
      className="border-start-0 ps-0"
      onChange={(e) => onSearch(e.target.value)}
    />
  </InputGroup>
);

const TableHead = () => (
  <thead>
    <tr>
      <th className="border-0 py-3">
        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Client</div>
      </th>
      <th className="border-0 py-3">
        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Status</div>
      </th>
      {/* Add other headers as needed */}
    </tr>
  </thead>
);

const TableBody = ({ data }) => (
  <tbody>
    {data.map((campaign, index) => (
      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-light'}>
        <td className="py-3">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" 
                style={{width: '36px', height: '36px', minWidth: '36px'}}>
              <span className="text-primary fw-bold">
                {getClientNameFromId(campaign.clientId).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ms-3">
              <div className="fw-medium">{getClientNameFromId(campaign.clientId)}</div>
              <div className="text-muted small">ID: {campaign.clientId || 'N/A'}</div>
            </div>
          </div>
        </td>
        <td className="py-3">
          <span className={`badge rounded-pill ${
            campaign.status === 'Active' ? 'bg-success-subtle text-success' : 
            campaign.status === 'Paused' ? 'bg-warning-subtle text-warning' : 
            'bg-secondary-subtle text-secondary'
          } px-3 py-2`}>
            {campaign.status}
          </span>
        </td>
        {/* Add other cells as needed */}
      </tr>
    ))}
  </tbody>
);

const TablePagination = ({ pagination, onPageChange }) => (
  <div className="mt-4 pagination-container">
    <div className="d-flex justify-content-between align-items-center flex-wrap">
      <div className="pagination-info mb-2 mb-md-0">
        <span className="badge bg-light text-dark px-3 py-2">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
      </div>
      <nav>
        <Pagination className="mb-0">
          <Pagination.First 
            onClick={() => onPageChange(1)} 
            disabled={pagination.currentPage === 1}
            className="rounded-start"
          />
          <Pagination.Prev 
            onClick={() => onPageChange(pagination.currentPage - 1)} 
            disabled={pagination.currentPage === 1}
          />
          {/* Pagination items would go here */}
          <Pagination.Next 
            onClick={() => onPageChange(pagination.currentPage + 1)} 
            disabled={pagination.currentPage === pagination.totalPages}
          />
          <Pagination.Last 
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="rounded-end"
          />
        </Pagination>
      </nav>
    </div>
  </div>
);

const NoDataAlert = () => (
  <Alert variant="info" className="border-0 bg-light border-start border-5 border-info">
    <div className="d-flex align-items-center">
      <div className="me-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div>
        <h6 className="mb-1">No client data available</h6>
        <p className="mb-0 text-muted">Try adjusting your filter criteria or date range.</p>
      </div>
    </div>
  </Alert>
);

export default CampaignTable;