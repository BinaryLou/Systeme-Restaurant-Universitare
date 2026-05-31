import axiosClient from "./axiosClient";

export const getDashboardStats = async () => {
  const response = await axiosClient.get("/admin/dashboard/stats");
  return response.data; 
};

export const getDetailedStatistics = async (period = 'week') => {
  const now = new Date();
  let query = `?period=${period}`;
  
  if (period === 'day') {
    const date = now.toISOString().split('T')[0];
    query += `&date=${date}`;
  } else if (period === 'week') {
    const endDate = now.toISOString().split('T')[0];
    const start = new Date(now);
    start.setDate(now.getDate() - 6); // Last 7 days
    const startDate = start.toISOString().split('T')[0];
    query += `&startDate=${startDate}&endDate=${endDate}`;
  } else if (period === 'month') {
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    query += `&month=${month}&year=${year}`;
  }

  const response = await axiosClient.get(`/admin/statistics${query}`);
  return response.data;
};
