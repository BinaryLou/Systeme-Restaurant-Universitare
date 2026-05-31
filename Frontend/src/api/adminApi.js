import axiosClient from "./axiosClient";

export const adminApi = {
  // --- PROFILE ---
  getProfile: async () => {
    const response = await axiosClient.get(`/auth/admin/profile`);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await axiosClient.patch(`/auth/admin/change-password`, passwordData);
    return response.data;
  },

  // --- USERS MANAGEMENT ---
  getUsers: async (searchTerm = "") => {
    const response = await axiosClient.get(`/admin/users`, {
      params: { search: searchTerm },
    });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axiosClient.post(`/admin/users`, userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await axiosClient.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  adjustUserBalance: async (id, amount) => {
    const response = await axiosClient.patch(`/admin/users/${id}/balance`, { amount });
    return response.data;
  },
};
