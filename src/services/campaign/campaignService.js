import { get } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const campaignService = {
  // Lấy danh sách campaign có phân trang
  getCampaignsPaginated: async (filters) => {
    const response = await get(ENDPOINTS.CAMPAIGN.GET_PAGE, {
      pageNum: filters.currentPage,
      pageSize: filters.pageSize,
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end,
      search: filters.search,
      status: filters.status
    });
    
    return {
      data: response.data,
      pagination: {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems
      }
    };
  },

  // Lấy tất cả campaign
  getAllCampaigns: async () => {
    const response = await get(ENDPOINTS.CAMPAIGN.GET_ALL);
    return this.processCampaignData(response);
  },

  // Lấy dữ liệu cho biểu đồ
  getChartData: async (dateRange) => {
    const response = await get(ENDPOINTS.CAMPAIGN.GET_CHART_DATA, {
      startDate: dateRange.start,
      endDate: dateRange.end
    });
    return this.processCampaignData(response);
  },

  // Xử lý và chuẩn hóa dữ liệu campaign
  processCampaignData: (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData.map(item => ({
      ...item,
      date: new Date(item.date).toISOString().split('T')[0],
      impressions: Number(item.impressions || 0),
      clicks: Number(item.clicks || 0),
      spend: Number(item.spend || 0),
      sales: Number(item.sales || 0)
    }));
  }
};
