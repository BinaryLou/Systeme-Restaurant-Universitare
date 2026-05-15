import axiosClient from "../api/axiosClient";

export const createReservation = async ({ date_repas, id_service }) => {
  const response = await axiosClient.post("/reservations", {
    date_repas,
    id_service,
  });

  return response?.data?.data || response?.data || response;
};

export const getMyReservations = async () => {
  const response = await axiosClient.get("/reservations");

  return response?.data?.data || response?.data || response;
};

export const cancelReservation = async (reservationId) => {
  const response = await axiosClient.patch(
    `/reservations/${reservationId}/cancel`
  );

  return response?.data?.data || response?.data || response;
};