import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 (Unauthorized) errors, not 403 (Forbidden)
    // 403 errors should be handled by the component, not cause logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Only logout if refresh truly fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For 403 errors, don't log out - just reject the error
    // Components should handle 403 errors appropriately
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    if (file) {
      formData.append('idProof', file);
    }
    return api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  login: (data) => api.post('/auth/login', data),
  logout: (data) => api.post('/auth/logout', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/update', data),
  changePassword: (data) => api.put('/users/change-password', data),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/users/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deletePhoto: () => api.delete('/users/delete-photo'),
};

// Crop APIs
export const cropAPI = {
  getCrops: () => api.get('/crops'),
  addCrop: (data) => api.post('/crops', data),
  deleteCrop: (id) => api.delete(`/crops/${id}`),
  getCropsByFarmer: (farmerId) => api.get(`/crops/farmer/${farmerId}`),
};

// Disease Report APIs
export const diseaseReportAPI = {
  getReports: () => api.get('/disease-reports'),
  createReport: (data, files) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    files.forEach((file) => {
      formData.append('images', file);
    });
    return api.post('/disease-reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  detectDisease: (cropName, file) => {
    const formData = new FormData();
    formData.append('cropName', cropName);
    formData.append('file', file);
    return api.post('/disease-reports/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  markTreated: (id) => api.put(`/disease-reports/${id}/mark-treated`),
  deleteReport: (id) => api.delete(`/disease-reports/${id}`),
};

// Agronomist APIs
export const agronomistAPI = {
  getProfile: () => api.get('/agronomists/me'),
  updateProfile: (data) => api.put('/agronomists/me', data),
  verifyAgronomist: (id, status = 'verified') => api.put(`/agronomists/${id}/verify`, { status }),
  findLocalExperts: () => api.get('/agronomists/local'),
  findLocalFarmers: () => api.get('/agronomists/farmers'),
};

// Admin APIs
export const adminAPI = {
  listFarmers: () => api.get('/admin/farmers'),
  deleteFarmer: (id) => api.delete(`/admin/farmers/${id}`),
  listAgronomists: () => api.get('/admin/agronomists'),
  deleteAgronomist: (id) => api.delete(`/admin/agronomists/${id}`),
};

// Weather APIs
export const weatherAPI = {
  getWeather: () => api.get('/weather'),
};

// Advisory APIs
export const advisoryAPI = {
  getAdvisories: () => api.get('/advisories'),
};

// ML Server APIs
export const mlServerAPI = {
  getStatus: () => api.get('/ml-server/status'),
};

// Media APIs
export const mediaAPI = {
  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;

