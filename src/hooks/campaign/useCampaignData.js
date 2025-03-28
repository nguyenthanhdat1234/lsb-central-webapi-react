import { useState, useEffect } from 'react';
import { campaignService } from '../../services/campaign/campaignService';
import { useFilters } from './useFilters';

export const useCampaignData = () => {
  const { filters, updateFilters } = useFilters();
  const [data, setData] = useState({
    stats: {},
    chartData: [],
    tableData: [],
    campaigns: [],
    pagination: { currentPage: 1, totalPages: 1 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await campaignService.getCampaignData(filters);
        setData(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return { data, loading, error, filters, updateFilters };
};
