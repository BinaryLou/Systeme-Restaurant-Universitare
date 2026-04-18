const isStrictDateFormat = (value) => {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
};

const isValidDate = (value) => {
  if (!isStrictDateFormat(value)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = value.trim().split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const parsedDate = new Date(year, month - 1, day);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() + 1 === month &&
    parsedDate.getDate() === day
  );
};

const parseLocalDate = (value) => {
  if (!isValidDate(value)) {
    return null;
  }

  const [year, month, day] = value.trim().split("-").map(Number);
  return new Date(year, month - 1, day);
};

module.exports = {
  isStrictDateFormat,
  isValidDate,
  parseLocalDate,
};