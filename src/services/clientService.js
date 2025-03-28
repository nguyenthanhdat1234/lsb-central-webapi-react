import { fetchFromApi } from './api';

export const clientService = {
  getClients: async () => {
    try {
      const response = await fetchFromApi('/api/Clients');
      return response || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }
};
