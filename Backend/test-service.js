require('dotenv').config();
const { resetPassword } = require("./src/services/userAuthService");

async function run() {
  try {
    console.log("Calling resetPassword...");
    await resetPassword({
      token: "invalid-token",
      newPassword: "Password123!",
      confirmPassword: "Password123!"
    });
    console.log("Success");
  } catch (err) {
    console.error("CAUGHT ERROR:", err);
    console.error("Stack:", err.stack);
  } finally {
    process.exit(0);
  }
}
run();
