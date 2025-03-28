import React from 'react';
import { Table, Badge, Card } from 'react-bootstrap';
import TablePagination from './TablePagination';
import TableSearch from './TableSearch';

const DataTable = ({ 
  data, 
  columns, 
  pagination, 
  onPageChange, 
  onSearch,
  title 
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title mb-0">{title}</h5>
          {onSearch && <TableSearch onSearch={onSearch} />}
        </div>

        <div className="table-responsive">
          <Table hover className="align-middle">
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
};

export default DataTable;
