import React from 'react';
import { Card, Table, Badge, Pagination } from 'react-bootstrap';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const SellerTable = ({ data, pagination, onPageChange }) => (
  <Card className="border-0 shadow-sm">
    <Card.Body>
      <h5 className="card-title mb-4">Recent Transactions</h5>
      <div className="table-responsive">
        <Table hover>
          <thead className="bg-light">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.orderId}</td>
                <td>{formatDate(item.date)}</td>
                <td>{formatCurrency(item.amount)}</td>
                <td>
                  <Badge bg={item.status === 'completed' ? 'success' : 'warning'}>
                    {item.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {pagination.totalPages > 1 && (
        <Pagination className="justify-content-end mt-3">
          {/* Pagination items */}
        </Pagination>
      )}
    </Card.Body>
  </Card>
);

export default SellerTable;
