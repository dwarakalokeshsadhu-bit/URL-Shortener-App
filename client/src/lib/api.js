import axios from 'axios';

const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

export const api = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api` : '/api',
  withCredentials: true
});
