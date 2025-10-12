import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – clear local session
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const path = window.location.pathname || "";
      // Avoid reload loops; pick the correct login page based on current section
      if (path.startsWith("/company")) {
        if (path !== "/clogin") window.location.replace("/clogin");
      } else if (path.startsWith("/admin")) {
        if (path !== "/alogin") window.location.replace("/alogin");
      } else if (path !== "/login" && path !== "/") {
        window.location.replace("/login");
      }
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      console.warn(
        "Rate limit exceeded. Please wait a moment before making more requests."
      );
      // You could show a toast notification here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

// Students API
export const studentsAPI = {
  getProfile: () => api.get("/students/profile"),
  updateProfile: (data) => api.put("/students/profile", data),
  getAll: (params) => api.get("/students", { params }),
  getById: (id) => api.get(`/students/${id}`),
  search: (params) => api.get("/students/search", { params }),
  endorse: (id, data) => api.post(`/students/${id}/endorse`, data),
  updateChecklist: (id, data) => api.put(`/students/${id}/checklist`, data),
  addBadge: (id, data) => api.post(`/students/${id}/badges`, data),
  removeBadge: (id, badgeId) => api.delete(`/students/${id}/badges/${badgeId}`),
  getInterestedCompanies: () => api.get("/students/interested-companies"),
  acceptCompanyInterest: (companyId) =>
    api.post(`/students/interested-companies/${companyId}/accept`),
  declineCompanyInterest: (companyId) =>
    api.post(`/students/interested-companies/${companyId}/decline`),
  getApplications: () => api.get("/students/applications"),
};

// Companies API
export const companiesAPI = {
  getProfile: () => api.get("/companies/profile"),
  updateProfile: (data) => api.put("/companies/profile", data),
  getAll: (params) => api.get("/companies", { params }),
  getById: (id) => api.get(`/companies/${id}`),
  search: (params) => api.get("/companies/search", { params }),
  addSlot: (data) => api.post("/companies/slots", data),
  updateSlot: (slotId, data) => api.put(`/companies/slots/${slotId}`, data),
  deleteSlot: (slotId) => api.delete(`/companies/slots/${slotId}`),
  addPreferredApplicant: (id, data) =>
    api.post(`/companies/${id}/preferred-applicants`, data),
  removePreferredApplicant: (id, studentId) =>
    api.delete(`/companies/${id}/preferred-applicants/${studentId}`),
  verify: (id, data) => api.put(`/companies/${id}/verify`, data),
  applyToInternship: (companyId, slotId) =>
    api.post(`/companies/${companyId}/slots/${slotId}/apply`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  getAllUsers: (params) => api.get("/admin/users", { params }),
  getPendingVerifications: () => api.get("/admin/pending-verifications"),
  verifyUser: (id, data) => api.put(`/admin/users/${id}/verify`, data),
  rejectUser: (id, data) => api.put(`/admin/users/${id}/reject`, data),
  getSystemLogs: (params) => api.get("/admin/logs", { params }),
  createAnnouncement: (data) => api.post("/admin/announcements", data),
  getReports: (params) => api.get("/admin/reports", { params }),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get("/chat/conversations"),
  getMessages: (userId) => api.get(`/chat/messages/${userId}`),
  sendMessage: (data) => api.post("/chat/send", data),
  markAsRead: (messageId) => api.put(`/chat/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
  getUnreadCount: () => api.get("/chat/unread-count"),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get("/notifications", { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get("/notifications/unread-count"),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  uploadProfilePicture: (formData) => {
    // Create a custom axios instance for file uploads
    const uploadApi = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      timeout: 30000,
      headers: {
        // Don't set Content-Type for file uploads - let browser set it with boundary
      },
    });

    // Add auth token
    const token = localStorage.getItem("token");
    console.log("🔍 Token from localStorage:", {
      token: token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 50)}...` : "none",
    });

    if (token) {
      uploadApi.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error("❌ No token found in localStorage for upload");
    }

    console.log("🔍 Upload request:", {
      url: `${API_BASE_URL}/users/upload-profile-picture`,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "none",
      formDataKeys: Array.from(formData.keys()),
    });

    return uploadApi.post("/users/upload-profile-picture", formData);
  },
  uploadFile: (formData) => {
    // Create a custom axios instance for file uploads
    const uploadApi = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      timeout: 30000,
      headers: {
        // Don't set Content-Type for file uploads - let browser set it with boundary
      },
    });

    // Add auth token
    const token = localStorage.getItem("token");
    if (token) {
      uploadApi.defaults.headers.Authorization = `Bearer ${token}`;
    }

    return uploadApi.post("/users/upload-file", formData);
  },
};

export { api };
export default api;
