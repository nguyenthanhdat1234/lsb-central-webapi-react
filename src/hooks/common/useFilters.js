import { useLocalStorage } from './useLocalStorage';

export const useFilters = (key, initialState) => {
  const [filters, setFilters] = useLocalStorage(key, initialState);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.search !== undefined ? 1 : prev.page
    }));
  };

  return { filters, updateFilters };
};

// Xóa các file:
// - src/hooks/campaign/useCampaignFilters.js
// - src/hooks/seller/useSellerFilters.js
