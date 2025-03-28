import { get, post } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const sellerService = {
  getSellerSummary: async (filters) => {
    const response = await get(ENDPOINTS.SELLER.GET_SUMMARY, filters);
    return {
      statistics: response.statistics,
      chartData: response.chartData,
      tableData: response.tableData,
      pagination: response.pagination
    };
  }
};
