const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const db = require("../src/config/db");
const {
  getExceptionByDate,
  createMenuException,
  updateMenuException,
  deleteMenuException,
  getExceptionsByMonth,
} = require("../src/models/menuExceptionModel");

const run = async () => {
  try {
    console.log("=== GET BY DATE ===");
    const byDate = await getExceptionByDate("2026-01-28");
    console.log(byDate);

    console.log("=== GET BY MONTH ===");
    const monthly = await getExceptionsByMonth(2026, 1);
    console.log(monthly);

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      console.log("=== CREATE TEST ===");
      const created = await createMenuException(connection, {
        menu_date: "2026-02-15",
        weekly_menu_id: 1,
        label: "Exception test",
        lunch_content: {
          entree: "Test entree",
          plat: "Test plat",
        },
        dinner_content: {
          entree: "Test soir",
          plat: "Test soir plat",
        },
        is_published: true,
        is_closed: false,
        reason: "Test model",
        created_by_admin_id: 1,
        updated_by_admin_id: 1,
      });

      console.log(created);

      console.log("=== UPDATE TEST ===");
      const updated = await updateMenuException(
        connection,
        created.id_menu_exception,
        {
          menu_date: "2026-02-15",
          weekly_menu_id: 2,
          label: "Exception test modifiee",
          lunch_content: {
            entree: "Maj entree",
            plat: "Maj plat",
          },
          dinner_content: null,
          is_published: false,
          is_closed: false,
          reason: "Maj test",
          updated_by_admin_id: 1,
        }
      );

      console.log("updated:", updated);

      console.log("=== DELETE TEST ===");
      const deleted = await deleteMenuException(
        connection,
        created.id_menu_exception
      );

      console.log("deleted:", deleted);

      await connection.rollback();
      console.log("Tests create/update/delete OK (rollback effectué)");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();