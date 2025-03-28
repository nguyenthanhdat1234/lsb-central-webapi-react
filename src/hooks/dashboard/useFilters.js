import { useState } from 'react';
import { useLocalStorage } from '../common/useLocalStorage';

export const useFilters = () => {
  const [filters, setFilters] = useLocalStorage('dashboard_filters', {
    campaign: 'all',
    dateRange: {
      start: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    page: 1
  });

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return { filters, updateFilters };
};
