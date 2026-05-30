import axiosClient from "./axiosClient";

export const getWeeklyMenus = async () => {
  const response = await axiosClient.get("/admin/weekly-menus");
  return response.data || response;
};

export const getWeeklyMenuByDay = async (dayOfWeek) => {
  const response = await axiosClient.get(`/admin/weekly-menus/${dayOfWeek}`);
  return response.data || response;
};

export const upsertWeeklyMenu = async (dayOfWeek, payload) => {
  const response = await axiosClient.put(`/admin/weekly-menus/${dayOfWeek}`, payload);
  return response.data || response;
};

export const publishWeeklyMenu = async (dayOfWeek, isPublished) => {
  const response = await axiosClient.patch(`/admin/weekly-menus/${dayOfWeek}/publish`, { is_published: isPublished });
  return response.data || response;
};

export const getMenusCalendar = async (year, month) => {
  const response = await axiosClient.get(`/admin/menus/calendar?year=${year}&month=${month}`);
  return response.data || response;
};

export const getMenuByDate = async (date) => {
  const response = await axiosClient.get(`/menus/by-date/${date}`);
  return response.data || response;
};

export const createMenuException = async (payload) => {
  const response = await axiosClient.post("/admin/menu-exceptions", payload);
  return response.data || response;
};

export const updateMenuException = async (id, payload) => {
  const response = await axiosClient.patch(`/admin/menu-exceptions/${id}`, payload);
  return response.data || response;
};

export const deleteMenuException = async (id) => {
  const response = await axiosClient.delete(`/admin/menu-exceptions/${id}`);
  return response.data || response;
};

