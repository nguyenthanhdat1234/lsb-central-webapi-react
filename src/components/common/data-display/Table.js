import React from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';
import Card from '../UI/Card';
import SearchInput from '../form/SearchInput';
import TablePagination from '../navigation/TablePagination';

const Table = ({ 
  data, 
  columns, 
  pagination, 
  onPageChange, 
  onSearch,
  title 
}) => (
  <Card>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="card-title mb-0">{title}</h5>
        {onSearch && <SearchInput onSearch={onSearch} />}
      </div>

      {/* ...existing table code... */}
    </Card.Body>
  </Card>
);

export default Table;
