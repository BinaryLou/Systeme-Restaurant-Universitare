require('dotenv').config();
const db = require("./src/config/db");

async function run() {
  try {
    const [rows] = await db.query("DESCRIBE admin_password_reset_tokens");
    console.log("admin_password_reset_tokens structure:");
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
