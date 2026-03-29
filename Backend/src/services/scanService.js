const processScanQrCode = async ({ qrCode }) => {
  return {
    qr_code: qrCode,
    scan_status: "PENDING_BUSINESS_RULES",
  };
};

module.exports = {
  processScanQrCode,
}; 
// un stub minimal temporaire pour que le controller soit testable sans casser si S4-05 n’est pas encore faite