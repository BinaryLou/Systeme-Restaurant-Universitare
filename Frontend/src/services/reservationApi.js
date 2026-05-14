import axiosClient from "../api/axiosClient";

export const createReservation = async ({ date_repas, id_service }) => {
  const response = await axiosClient.post("/reservations", {
    date_repas,
    id_service,
  });

  return response?.data?.data || response?.data || response;
};