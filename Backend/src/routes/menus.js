const express = require("express");
const verifyJwt = require("../middlewares/verifyJwt");
const requireRole = require("../middlewares/requireRole");
const {
  validateWeeklyMenuPayload,
  validateMenuExceptionCreatePayload,
  validateMenuExceptionUpdatePayload,
} = require("../middlewares/menuValidation");
const {
  getWeeklyMenusController,
  getWeeklyMenuByDayController,
  upsertWeeklyMenuController,
  publishWeeklyMenuController,
  createMenuExceptionController,
  updateMenuExceptionController,
  deleteMenuExceptionController,
  getMenusCalendarController,
} = require("../controllers/menuAdminController");

const router = express.Router();

router.use(verifyJwt);
router.use(requireRole("ADMIN"));

router.get("/weekly-menus", getWeeklyMenusController);

router.get("/weekly-menus/:dayOfWeek", getWeeklyMenuByDayController);

router.put(
  "/weekly-menus/:dayOfWeek",
  validateWeeklyMenuPayload,
  upsertWeeklyMenuController
);

router.patch(
  "/weekly-menus/:dayOfWeek/publish",
  publishWeeklyMenuController
);

router.post(
  "/menu-exceptions",
  validateMenuExceptionCreatePayload,
  createMenuExceptionController
);

router.patch(
  "/menu-exceptions/:id",
  validateMenuExceptionUpdatePayload,
  updateMenuExceptionController
);

router.delete(
  "/menu-exceptions/:id",
  deleteMenuExceptionController
);

router.get("/menus/calendar", getMenusCalendarController);

module.exports = router;