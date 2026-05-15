import axiosClient from "./axiosClient";

export const getStudentQrCode = async () => {
  const response = await axiosClient.get("/users/me/qr");
  return response?.data;
};