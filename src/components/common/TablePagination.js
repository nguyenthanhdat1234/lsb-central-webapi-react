import React from 'react';
import { Pagination } from 'react-bootstrap';

const TablePagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxPages = Math.min(totalPages, 5);
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(startPage + maxPages - 1, totalPages);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    return pages;
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <span className="text-muted">
        Page {currentPage} of {totalPages}
      </span>
      <Pagination className="mb-0">
        <Pagination.First 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
        />
        <Pagination.Prev 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        />
        {renderPageNumbers()}
        <Pagination.Next 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        />
        <Pagination.Last 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </div>
  );
};

export default TablePagination;
