const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const {
  resolveMenuByDate,
  getMonthlyMenuCalendar,
} = require("../src/services/menuResolverService");

const run = async () => {
  try {
    console.log("=== RESOLVE 2026-01-28 ===");
    const resolved1 = await resolveMenuByDate("2026-01-28");
    console.log(resolved1);

    console.log("=== RESOLVE 2026-01-27 ===");
    const resolved2 = await resolveMenuByDate("2026-01-27");
    console.log(resolved2);

    console.log("=== CALENDAR JAN 2026 ===");
    const calendar = await getMonthlyMenuCalendar(2026, 1);
    console.log(JSON.stringify(calendar, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();