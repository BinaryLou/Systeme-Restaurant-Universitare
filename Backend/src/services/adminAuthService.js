const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { findAdminByEmail, findAdminById, updateAdminPasswordById } = require("../models/adminModel");
const { createRefreshToken } = require("../models/refreshTokenModel");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

const loginAdmin = async (email, password) => {
  if (!email || !password) {
    throw new AppError("Email et mot de passe sont requis", 400);
  }

  const admin = await findAdminByEmail(email.trim().toLowerCase());

  if (!admin) {
    throw new AppError("Identifiants invalides", 401);
  }

  const isMatch = await bcrypt.compare(password, admin.mot_de_passe_hash);

  if (!isMatch) {
    throw new AppError("Identifiants invalides", 401);
  }

  const payload = {
    id: admin.id_admin,
    role: "ADMIN"
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createRefreshToken({
    tokenHash,
    accountType: "ADMIN",
    userId: null,
    adminId: admin.id_admin,
    expiresAt
  });

  return {
    admin: {
      id: admin.id_admin,
      email: admin.email,
      nom: admin.nom,
      prenom: admin.prenom,
      role: "ADMIN"
    },
    tokens: {
      accessToken,
      refreshToken,
    }
  };
};

const getAdminProfile = async (idAdmin) => {
  const admin = await findAdminById(idAdmin);
  if (!admin) {
    throw new AppError("Administrateur introuvable", 404);
  }
  return {
    id: admin.id_admin,
    email: admin.email,
    nom: admin.nom,
    prenom: admin.prenom,
    role: "ADMIN"
  };
};

const changeAdminPassword = async ({ adminId, oldPassword, newPassword, confirmPassword }) => {
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new AppError("Tous les champs sont obligatoires", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError("Les nouveaux mots de passe ne correspondent pas", 400);
  }

  const admin = await findAdminById(adminId);
  if (!admin) {
    throw new AppError("Administrateur introuvable", 404);
  }

  const isMatch = await bcrypt.compare(oldPassword, admin.mot_de_passe_hash);
  if (!isMatch) {
    throw new AppError("L'ancien mot de passe est incorrect", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  await updateAdminPasswordById(adminId, newPasswordHash);

  return true;
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  changeAdminPassword
};