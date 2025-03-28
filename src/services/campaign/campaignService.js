import { get } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const campaignService = {
  getCampaignData: async (filters) => {
    const response = await get(ENDPOINTS.CAMPAIGN.GET_PAGE, {
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
      pagination: {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems
      }
    };
  },

  getAllCampaigns: async () => {
    const response = await get(ENDPOINTS.CAMPAIGN.GET_ALL);
    return processCampaignData(response);
  },

  getChartData: async (dateRange) => {
    const response = await get(ENDPOINTS.CAMPAIGN.GET_CHART_DATA, {
      params: {
        startDate: dateRange.start,
        endDate: dateRange.end
      }
    });
    return processCampaignData(response);
  }
};

// Helper function to process campaign data
const processCampaignData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  
  return rawData.map(item => ({
    ...item,
    date: new Date(item.date).toISOString().split('T')[0],
    impressions: Number(item.impressions || 0),
    clicks: Number(item.clicks || 0),
    spend: Number(item.spend || 0),
    sales: Number(item.sales || 0)
  }));
};
