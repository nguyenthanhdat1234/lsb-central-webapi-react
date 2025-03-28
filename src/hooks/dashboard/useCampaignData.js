import { useState, useEffect } from 'react';
import { campaignService } from '../../services/campaignService';

export const useCampaignData = (dateRange, currentPage, pageSize) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await campaignService.getCampaignsPaginated(
          currentPage,
          pageSize,
          dateRange
        );

        setData(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, currentPage, pageSize]);

  return { 
    data, 
    loading, 
    error, 
    totalPages,
    totalItems,
    pageSize,
    currentPage 
  };
};
