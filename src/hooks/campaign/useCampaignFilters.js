import { useState } from 'react';
import { useLocalStorage } from '../common/useLocalStorage';
import { useDebounce } from '../common/useDebounce';

export const useCampaignFilters = () => {
  const [filters, setFilters] = useLocalStorage('campaign_filters', {
    search: '',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    campaignStatus: 'all',
    page: 1,
    pageSize: 10
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.search !== undefined ? 1 : prev.page
    }));
  };

  return {
    filters,
    debouncedSearch,
    updateFilters
  };
};
