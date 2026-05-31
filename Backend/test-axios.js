const axios = require("axios");

async function run() {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
      token: "invalid-token",
      new_password: "Password123!",
      confirm_password: "Password123!"
    });
    console.log("Success:", response.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
