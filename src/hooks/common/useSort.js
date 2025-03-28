import { useState } from 'react';

export const useSort = (initialSortField = '', initialSortOrder = 'asc') => {
  const [sortField, setSortField] = useState(initialSortField);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  const sortData = (data, field = sortField) => {
    if (!field) return data;

    return [...data].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  };

  const toggleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return { sortField, sortOrder, sortData, toggleSort };
};
