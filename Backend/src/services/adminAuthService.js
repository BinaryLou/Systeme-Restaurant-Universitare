const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { findAdminByEmail } = require("../models/adminModel");
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
      prenomnom: admin.prenom,
      role: "ADMIN"
    },
    tokens: {
      accessToken,
      refreshToken,
    }
  };
};

module.exports = {
  loginAdmin
};