import axiosClient from "../api/axiosClient";

export const getMenuByDate = async (date) => {
  const response = await axiosClient.get(`/menus/by-date/${date}`);

  // يدعم جوج الحالات:
  // 1) response = axios response
  // 2) response = response.data مباشرة من interceptor
  return response?.data?.data || response?.data || response;
};