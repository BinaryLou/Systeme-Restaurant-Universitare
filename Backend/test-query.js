require('dotenv').config();
const AppError = require("./src/utils/AppError");

async function run() {
  const db = require("./src/config/db");
  const adminModel = require("./src/models/adminModel");
  
  try {
    const id_admin = 1;
    console.log("querying db...");
    const result = await db.query("SELECT email FROM administrateur WHERE id_admin = ?", [id_admin]);
    console.log("result array:", result);
    
    const rows = result[0];
    console.log("rows:", rows);
    
    const email = rows[0].email;
    console.log("email:", email);
    
    const admin = await adminModel.findAdminByEmail(email);
    console.log("admin:", admin);

  } catch(e) {
    console.error("ERROR:", e);
  } finally {
    process.exit(0);
  }
}
run();
