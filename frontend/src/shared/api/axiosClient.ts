import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080/api',
});

axiosClient.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY;

  if (apiKey) {
    config.headers.set('X-Api-Key', apiKey);
  }

  return config;
});
