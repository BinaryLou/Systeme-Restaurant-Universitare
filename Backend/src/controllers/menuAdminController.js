const { sendSuccess } = require("../utils/apiResponse");
const {
  getWeeklyMenus,
  getWeeklyMenuByDayService,
  upsertWeeklyMenu,
  publishWeeklyMenu,
  createDateException,
  updateDateException,
  deleteDateException,
  getMonthlyMenuCalendar,
} = require("../services/menuResolverService");

const getAdminIdFromRequest = (req) => {
  return req.user?.id_admin || req.user?.id;
};

const getWeeklyMenusController = async (req, res, next) => {
  try {
    const data = await getWeeklyMenus();

    return sendSuccess(
      res,
      data,
      "Menus hebdomadaires récupérés avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const getWeeklyMenuByDayController = async (req, res, next) => {
  try {
    const dayOfWeek = Number(req.params.dayOfWeek);
    const data = await getWeeklyMenuByDayService(dayOfWeek);

    return sendSuccess(
      res,
      data,
      "Menu hebdomadaire récupéré avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const upsertWeeklyMenuController = async (req, res, next) => {
  try {
    const dayOfWeek = Number(req.params.dayOfWeek);
    const adminId = getAdminIdFromRequest(req);

    const data = await upsertWeeklyMenu({
      dayOfWeek,
      payload: req.body,
      adminId,
    });

    return sendSuccess(
      res,
      data,
      "Menu hebdomadaire enregistré avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const publishWeeklyMenuController = async (req, res, next) => {
  try {
    const dayOfWeek = Number(req.params.dayOfWeek);
    const adminId = getAdminIdFromRequest(req);
    const { is_published } = req.body;

    const data = await publishWeeklyMenu({
      dayOfWeek,
      isPublished: is_published,
      adminId,
    });

    return sendSuccess(
      res,
      data,
      "Statut de publication mis à jour avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const createMenuExceptionController = async (req, res, next) => {
  try {
    const adminId = getAdminIdFromRequest(req);

    const data = await createDateException({
      payload: req.body,
      adminId,
    });

    return sendSuccess(
      res,
      data,
      "Exception de menu créée avec succès",
      201
    );
  } catch (error) {
    return next(error);
  }
};

const updateMenuExceptionController = async (req, res, next) => {
  try {
    const adminId = getAdminIdFromRequest(req);
    const id = Number(req.params.id);

    const data = await updateDateException({
      id,
      payload: req.body,
      adminId,
    });

    return sendSuccess(
      res,
      data,
      "Exception de menu mise à jour avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const deleteMenuExceptionController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const data = await deleteDateException(id);

    return sendSuccess(
      res,
      data,
      "Exception de menu supprimée avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

const getMenusCalendarController = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    const data = await getMonthlyMenuCalendar(year, month);

    return sendSuccess(
      res,
      data,
      "Calendrier des menus récupéré avec succès",
      200
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getWeeklyMenusController,
  getWeeklyMenuByDayController,
  upsertWeeklyMenuController,
  publishWeeklyMenuController,
  createMenuExceptionController,
  updateMenuExceptionController,
  deleteMenuExceptionController,
  getMenusCalendarController,
};