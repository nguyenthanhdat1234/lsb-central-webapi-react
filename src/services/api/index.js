import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';

export const campaignService = {
  getCampaignData: async (filters) => {
    const response = await apiClient.get(ENDPOINTS.CAMPAIGN.GET_PAGE, {
      params: {
        pageNum: filters.currentPage,
        pageSize: filters.pageSize,
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        search: filters.search,
        status: filters.status
      }
    });
    return {
      data: processCampaignData(response.data),
      pagination: response.pagination
    };
  },

  getChartData: async (dateRange) => {
    // ...existing code...
  }
};

export const sellerService = {
  getSellerSummary: async (filters) => {
    const response = await apiClient.get(ENDPOINTS.SELLER.GET_SUMMARY, { params: filters });
    return {
      statistics: response.statistics,
      chartData: response.chartData,
      tableData: response.tableData,
      pagination: response.pagination
    };
  }
};
