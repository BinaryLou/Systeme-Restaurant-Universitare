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