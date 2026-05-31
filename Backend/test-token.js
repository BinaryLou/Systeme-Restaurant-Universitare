const axios = require('axios');

async function run() {
  try {
    const db = require("./src/config/db");
    const [rows] = await db.query("SELECT * FROM admin_password_reset_tokens ORDER BY created_at DESC LIMIT 1");
    if (rows.length === 0) {
      console.log("No token");
      return;
    }
    
    // Actually we don't have the raw token, only the hash!
    // We can't reset without the raw token.
    console.log("Token hash:", rows[0].token_hash);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  } finally {
    process.exit(0);
  }
}
run();
