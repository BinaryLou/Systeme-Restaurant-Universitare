const AppError = require("../utils/AppError");
const {
  getWeeklyMenuByDay,
} = require("../models/weeklyMenuModel");
const {
  getExceptionByDate,
  getExceptionsByMonth,
} = require("../models/menuExceptionModel");

const toDateString = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return String(value);
};

const getDayOfWeekFromDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ... 6=Saturday

  return jsDay === 0 ? 7 : jsDay;
};

const buildResolvedMenu = ({ date, source, menu }) => {
  if (!menu) {
    return {
      date,
      source: "none",
      label: null,
      is_closed: false,
      is_published: false,
      lunch_content: null,
      dinner_content: null,
      weekly_menu_id: null,
      menu_exception_id: null,
      reason: null,
    };
  }

  return {
    date,
    source,
    label: menu.label,
    is_closed: menu.is_closed,
    is_published: menu.is_published,
    lunch_content: menu.lunch_content,
    dinner_content: menu.dinner_content,
    weekly_menu_id:
      source === "standard"
        ? menu.id_weekly_menu
        : menu.weekly_menu_id ?? null,
    menu_exception_id:
      source === "exception" ? menu.id_menu_exception : null,
    reason: source === "exception" ? menu.reason ?? null : null,
  };
};

const resolveMenuByDate = async (date) => {
  const normalizedDate = toDateString(date);

  if (!normalizedDate) {
    throw new AppError("Date de menu invalide", 400);
  }

  const exception = await getExceptionByDate(normalizedDate);

  if (exception && exception.is_published) {
    return buildResolvedMenu({
      date: normalizedDate,
      source: "exception",
      menu: exception,
    });
  }

  const dayOfWeek = getDayOfWeekFromDate(normalizedDate);
  const weeklyMenu = await getWeeklyMenuByDay(dayOfWeek);

  if (weeklyMenu && weeklyMenu.is_published) {
    return buildResolvedMenu({
      date: normalizedDate,
      source: "standard",
      menu: weeklyMenu,
    });
  }

  return buildResolvedMenu({
    date: normalizedDate,
    source: "none",
    menu: null,
  });
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const getMonthlyMenuCalendar = async (year, month) => {
  if (!year || !month) {
    throw new AppError("Année et mois sont obligatoires", 400);
  }

  const parsedYear = Number(year);
  const parsedMonth = Number(month);

  if (
    Number.isNaN(parsedYear) ||
    Number.isNaN(parsedMonth) ||
    parsedMonth < 1 ||
    parsedMonth > 12
  ) {
    throw new AppError("Année ou mois invalide", 400);
  }

  const exceptions = await getExceptionsByMonth(parsedYear, parsedMonth);
  const exceptionMap = new Map(
    exceptions.map((item) => [toDateString(item.menu_date), item])
  );

  const daysInMonth = getDaysInMonth(parsedYear, parsedMonth);
  const days = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${parsedYear}-${String(parsedMonth).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const exception = exceptionMap.get(date);

    if (exception && exception.is_published) {
      days.push({
        date,
        type: exception.is_closed ? "closed" : "exception",
        is_closed: exception.is_closed,
        has_menu: !exception.is_closed,
        source_id: exception.id_menu_exception,
        label: exception.label,
      });
      continue;
    }

    const dayOfWeek = getDayOfWeekFromDate(date);
    const weeklyMenu = await getWeeklyMenuByDay(dayOfWeek);

    if (weeklyMenu && weeklyMenu.is_published) {
      days.push({
        date,
        type: weeklyMenu.is_closed ? "closed" : "standard",
        is_closed: weeklyMenu.is_closed,
        has_menu: !weeklyMenu.is_closed,
        source_id: weeklyMenu.id_weekly_menu,
        label: weeklyMenu.label,
      });
      continue;
    }

    days.push({
      date,
      type: "none",
      is_closed: false,
      has_menu: false,
      source_id: null,
      label: null,
    });
  }

  return {
    year: parsedYear,
    month: parsedMonth,
    days,
  };
};

module.exports = {
  resolveMenuByDate,
  getMonthlyMenuCalendar,
};