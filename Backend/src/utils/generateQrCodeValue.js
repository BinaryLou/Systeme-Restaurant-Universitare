const crypto = require("crypto");

const generateQrCodeValue = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString("hex");
};

module.exports = generateQrCodeValue;