import axiosClient from "./axiosClient";

export const loginStudent = async (credentials) => {
  const response = await axiosClient.post("/auth/user/login", credentials);
  return response.data;
};