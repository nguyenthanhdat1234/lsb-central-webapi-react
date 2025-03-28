import { useState } from 'react';
import { useLocalStorage } from '../common/useLocalStorage';
import { useDebounce } from '../common/useDebounce';

export const useSellerFilters = () => {
  const [filters, setFilters] = useLocalStorage('seller_filters', {
    platform: 'all',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    page: 1,
    pageSize: 10
  });

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return { filters, updateFilters };
};
