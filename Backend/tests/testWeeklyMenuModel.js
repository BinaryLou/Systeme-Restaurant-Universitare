require("dotenv").config();
const db = require("../src/config/db");
const {
  getAllWeeklyMenus,
  getWeeklyMenuByDay,
  createWeeklyMenu,
  updateWeeklyMenu,
  setWeeklyMenuPublishStatus,
} = require("../src/models/weeklyMenuModel");

const run = async () => {
  try {
    console.log("=== GET ALL ===");
    const all = await getAllWeeklyMenus();
    console.log(all);

    console.log("=== GET MONDAY ===");
    const monday = await getWeeklyMenuByDay(1);
    console.log(monday);

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      console.log("=== CREATE SUNDAY TEST ===");
      await createWeeklyMenu(connection, {
        day_of_week: 7,
        label: "Test dimanche",
        lunch_content: null,
        dinner_content: null,
        is_published: false,
        is_closed: true,
        created_by_admin_id: 1,
        updated_by_admin_id: 1,
      });

      await connection.rollback();
      console.log("Create test OK (rollback effectué)");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const connection2 = await db.getConnection();

    try {
      await connection2.beginTransaction();

      console.log("=== UPDATE MONDAY ===");
      const updated = await updateWeeklyMenu(connection2, 1, {
        label: "Menu lundi modifié test",
        lunch_content: {
          entree: "Test entrée",
          plat: "Test plat",
        },
        dinner_content: {
          entree: "Test soir",
          plat: "Test soir plat",
        },
        is_published: true,
        is_closed: false,
        updated_by_admin_id: 1,
      });

      console.log("updated:", updated);

      const publishUpdated = await setWeeklyMenuPublishStatus(
        connection2,
        1,
        false,
        1
      );

      console.log("publishUpdated:", publishUpdated);

      await connection2.rollback();
      console.log("Update test OK (rollback effectué)");
    } catch (error) {
      await connection2.rollback();
      throw error;
    } finally {
      connection2.release();
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();