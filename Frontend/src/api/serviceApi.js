import axiosClient from "./axiosClient";

export const getServices = async () => {
  const response = await axiosClient.get("/services");
  return response.data;
};

export const updateService = async (id, payload) => {
  const response = await axiosClient.put(`/services/${id}`, payload);
  return response.data;
};
