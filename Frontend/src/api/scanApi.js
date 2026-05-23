import axiosClient from "./axiosClient";

export const validateTicket = async (qrCode, pin) => {
  return await axiosClient.post(
    "/scan",
    { qr_code: qrCode },
    {
      headers: {
        "x-scan-pin": pin,
      },
    }
  );
};
