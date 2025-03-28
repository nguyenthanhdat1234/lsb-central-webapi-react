import { fetchFromApi } from './api';

export const campaignService = {
  getCampaigns: (pageNum, pageSize) => 
    fetchFromApi(`/api/CampaignDailyReports/GetPage?PageNum=${pageNum}&PageSize=${pageSize}`),

  processCampaignData: (rawData) => {
    return rawData.map(item => ({
      ...item,
      date: new Date(item.date).toISOString().split('T')[0],
    }));
  }
};
