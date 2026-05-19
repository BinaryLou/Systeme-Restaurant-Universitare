import axiosClient, { setAccessToken, clearAccessToken } from "./axiosClient";

export const loginStudent = async (credentials) => {
  const response = await axiosClient.post("/auth/user/login", credentials);

  const token = response.data?.accessToken;

  if (token) {
    setAccessToken(token);
  }

  return response;
};

export const loginAdmin = async (credentials) => {
  const response = await axiosClient.post("/auth/admin/login", credentials);

  const token = response.data?.accessToken;

  if (token) {
    setAccessToken(token);
  }

  return response;
};

export const refreshToken = async () => {
  const response = await axiosClient.post("/auth/refresh");

  const token = response.data?.accessToken;

  if (token) {
    setAccessToken(token);
  }

  return response;
};

export const logoutApi = async () => {
  try {
    await axiosClient.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
};

export const forgotPassword = async (email) => {
  return axiosClient.post("/auth/forgot-password", { email });
};

export const resetPassword = async (payload) => {
  return axiosClient.post("/auth/reset-password", payload);
};

export const changePassword = async (payload) => {
  return axiosClient.patch("/auth/change-password", payload);
};