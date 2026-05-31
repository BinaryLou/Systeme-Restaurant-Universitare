const crypto = require("crypto");
const { resetPassword } = require("./src/services/userAuthService");

async function run() {
  try {
    const db = require("./src/config/db");

    // Get the most recent admin reset token
    const [rows] = await db.query("SELECT * FROM admin_password_reset_tokens ORDER BY created_at DESC LIMIT 1");
    if (rows.length === 0) {
      console.log("No admin reset token found");
      process.exit(0);
    }
    
    // We only have the hash in the DB. We need the raw token to call resetPassword.
    // Let's generate a new raw token, hash it, and manually insert it, then call resetPassword
    
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const adminResetModel = require("./src/models/adminPasswordResetTokenModel");
    const adminId = 1; // Assuming id_admin = 1 exists
    
    const conn = await db.getConnection();
    await adminResetModel.createResetToken(conn, adminId, tokenHash, expiresAt);
    conn.release();

    console.log("Calling resetPassword...");
    await resetPassword({
      token: rawToken,
      newPassword: "Password123!",
      confirmPassword: "Password123!"
    });
    console.log("Success");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}
run();
