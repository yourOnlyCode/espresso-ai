import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const documentAPI = {
  getAll: (params?: any) => api.get('/documents', { params }),
  getById: (id: string) => api.get(`/documents/${id}`),
  create: (data: any) => api.post('/documents', data),
  update: (id: string, data: any) => api.put(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
  generatePDF: (id: string, variables: any) => api.post(`/documents/${id}/generate-pdf`, { variables }),
  analyze: (id: string) => api.post(`/documents/${id}/analyze`),
  getVersions: (id: string) => api.get(`/documents/${id}/versions`),
};

export const templateAPI = {
  getAll: (params?: any) => api.get('/templates', { params }),
  getById: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
  use: (id: string) => api.post(`/templates/${id}/use`),
};

export const workflowAPI = {
  getAll: () => api.get('/workflows'),
  create: (data: any) => api.post('/workflows', data),
  start: (id: string, data: any) => api.post(`/workflows/${id}/start`, data),
  getInstances: () => api.get('/workflows/instances'),
  approve: (approvalId: string, comments: string) => api.post(`/workflows/approvals/${approvalId}/approve`, { comments }),
  reject: (approvalId: string, comments: string) => api.post(`/workflows/approvals/${approvalId}/reject`, { comments }),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getDocuments: (params?: any) => api.get('/analytics/documents', { params }),
  getUsers: () => api.get('/analytics/users'),
  getCompliance: () => api.get('/analytics/compliance'),
};

export default api;
