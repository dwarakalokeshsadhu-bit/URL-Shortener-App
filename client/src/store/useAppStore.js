import { create } from 'zustand';
import { api } from '../lib/api';

export const useAppStore = create((set, get) => ({
  user: null,
  urls: [],
  loading: false,
  result: null,
  error: '',

  setResult: (result) => set({ result }),
  clearError: () => set({ error: '' }),

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/check');
      set({ user: data.user });
    } catch {
      set({ user: null });
    }
  },

  login: async (payload) => {
    set({ loading: true, error: '' });
    try {
      const { data } = await api.post('/auth/login', payload);
      set({ user: data.user, loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: '' });
    try {
      const { data } = await api.post('/auth/register', payload);
      set({ user: data.user, loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Signup failed', loading: false });
      return false;
    }
  },

  googleLogin: async () => {
    window.location.href = `${api.defaults.baseURL || '/api'}/auth/google`;
  },

  logout: async () => {
    set({ user: null, urls: [], result: null, error: '', loading: false });
    api.post('/auth/logout').catch(() => {});
  },

  upgradePlan: async (payload) => {
    set({ loading: true, error: '' });
    try {
      const { data } = await api.post('/billing/upgrade', payload);
      set({ user: data.user, loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Upgrade failed', loading: false });
      return false;
    }
  },

  createUrl: async (payload) => {
    set({ loading: true, error: '' });
    try {
      const { data } = await api.post('/url', payload);
      set({ result: data.url, urls: [data.url, ...get().urls], loading: false });
      return data.url;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Could not shorten URL', loading: false });
      return null;
    }
  },

  fetchUrls: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/url');
      set({ urls: data.urls, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  deleteUrl: async (id) => {
    await api.delete(`/url/${id}`);
    set({ urls: get().urls.filter((url) => url._id !== id) });
  },

  updateUrl: async (id, payload) => {
    const { data } = await api.put(`/url/${id}`, payload);
    set({ urls: get().urls.map((url) => (url._id === id ? data.url : url)) });
  }
}));
