import { useState, useEffect } from 'react';
import { fetchFromApi } from '../services/api';
import { generateReport, calculateTotals } from '../services/sellerReportService';

export const useSellerReport = (dateRange, pageSize, currentPage) => {
  const [data, setData] = useState({
    fullReport: [],
    paginatedReport: [],
    totals: null,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [campaigns, clients] = await Promise.all([
          fetchFromApi('/api/CampaignDailyReports'),
          fetchFromApi('/api/Clients')
        ]);

        const reportData = generateReport(campaigns, clients);
        const totals = calculateTotals(reportData);
        
        const totalPages = Math.ceil(reportData.length / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedData = reportData.slice(startIndex, startIndex + pageSize);

        setData({
          fullReport: reportData,
          paginatedReport: paginatedData,
          totals,
          totalPages
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, pageSize, currentPage]);

  return { ...data, loading, error };
};
