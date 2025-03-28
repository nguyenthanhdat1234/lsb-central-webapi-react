import { useState, useEffect } from 'react';
import { sellerService } from '../../services/seller/sellerService';

export const useSellerData = (filters) => {
  const [data, setData] = useState({
    statistics: {},
    chartData: [],
    tableData: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await sellerService.getSellerSummary(filters);
        setData(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return { data, loading, error };
};
