import axiosClient from "./axiosClient";

export const verifyStaffPin = async (pin) => {
  const response = await axiosClient.post(
    "/scan/access",
    { pin },
    {
      headers: {
        "x-scan-pin": pin,
      },
    }
  );

  return response.data;
};

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