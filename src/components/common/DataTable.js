import React from 'react';
import { Table, Card } from 'react-bootstrap';
import TablePagination from './TablePagination';
import TableSearch from './TableSearch';

const DataTable = ({ 
  data, 
  columns, 
  pagination, 
  onPageChange, 
  onSearch,
  title 
}) => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="p-2 p-sm-3 p-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h5 className="card-title mb-3 mb-md-0">{title}</h5>
        {onSearch && (
          <div className="w-100 w-md-auto" style={{maxWidth: '300px'}}>
            <TableSearch onSearch={onSearch} />
          </div>
        )}
      </div>

      <div className="table-responsive">
        <Table className="table-hover align-middle">
          <thead className="bg-light">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={column.className}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={column.className}>
                    {column.render ? column.render(item) : item[column.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination 
          pagination={pagination} 
          onPageChange={onPageChange}
        />
      )}
    </Card.Body>
  </Card>
);

export default DataTable;
