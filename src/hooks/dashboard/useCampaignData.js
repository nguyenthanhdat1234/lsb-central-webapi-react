import { useState, useEffect } from 'react';
import { fetchFromApi } from '../../services/api';
import { processAndAggregateData, generateTableData } from '../../services/campaignService';

export const useCampaignData = (dateRange, currentPage, pageSize) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchFromApi('/api/CampaignDailyReports');
        const processedData = processAndAggregateData(response, dateRange);
        const tableData = generateTableData(processedData);
        
        setData(processedData);
        setTotalPages(Math.ceil(tableData.length / pageSize));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, currentPage, pageSize]);

  return { data, loading, error, totalPages };
};
