const AppError = require("../utils/AppError");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validatePasswordStrength = (password) => {
  if (!isNonEmptyString(password)) {
    return "Le mot de passe est obligatoire";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`;
  }

  if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial";
  }

  return null;
};

const validateForgotPasswordPayload = (req, res, next) => {
  const { email } = req.body || {};

  if (!isNonEmptyString(email)) {
    return next(new AppError("L'email ou le code Apogée est obligatoire", 400));
  }

  if (email.includes('@') && !EMAIL_REGEX.test(email.trim().toLowerCase())) {
    return next(new AppError("Format d'email invalide", 400));
  }

  return next();
};

const validateResetPasswordPayload = (req, res, next) => {
  const { token, new_password, confirm_password } = req.body || {};

  if (!isNonEmptyString(token)) {
    return next(new AppError("Le token est obligatoire", 400));
  }

  const passwordError = validatePasswordStrength(new_password);
  if (passwordError) {
    return next(new AppError(passwordError, 400));
  }

  if (!isNonEmptyString(confirm_password)) {
    return next(
      new AppError("La confirmation du mot de passe est obligatoire", 400)
    );
  }

  if (new_password !== confirm_password) {
    return next(
      new AppError("La confirmation du nouveau mot de passe est invalide", 400)
    );
  }

  return next();
};

const validateChangePasswordPayload = (req, res, next) => {
  const { old_password, new_password, confirm_password } = req.body || {};

  if (!isNonEmptyString(old_password)) {
    return next(new AppError("L'ancien mot de passe est obligatoire", 400));
  }

  const passwordError = validatePasswordStrength(new_password);
  if (passwordError) {
    return next(new AppError(passwordError, 400));
  }

  if (!isNonEmptyString(confirm_password)) {
    return next(
      new AppError("La confirmation du mot de passe est obligatoire", 400)
    );
  }

  if (new_password !== confirm_password) {
    return next(
      new AppError("La confirmation du nouveau mot de passe est invalide", 400)
    );
  }

  if (old_password === new_password) {
    return next(
      new AppError(
        "Le nouveau mot de passe doit être différent de l'ancien",
        400
      )
    );
  }

  return next();
};

module.exports = {
  validateForgotPasswordPayload,
  validateResetPasswordPayload,
  validateChangePasswordPayload,
};