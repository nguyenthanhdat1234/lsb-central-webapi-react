import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const get = async (url, params = {}) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const post = async (url, data = {}) => {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
