const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const { findUserByApogee ,findUserById ,findUserByQrCode } = require("../models/userModel");
const { createRefreshToken } = require("../models/refreshTokenModel");
const AppError = require("../utils/AppError");

const loginUser = async ({ apogee, password }) => {
  if (!apogee || !password) {
    throw new AppError("Code Apogée et mot de passe sont obligatoires", 400);
  }

  const user = await findUserByApogee(apogee.trim());

  if (!user) {
    throw new AppError("Identifiants invalides", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.mot_de_passe_hash
  );

  if (!isPasswordValid) {
    throw new AppError("Identifiants invalides", 401);
  }

  const payload = {
    id: user.id_utilisateur,
    role: "USER",
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const refreshExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await createRefreshToken({
    tokenHash,
    accountType: "USER",
    userId: user.id_utilisateur,
    adminId: null,
    expiresAt: refreshExpiresAt,
  });

  return {
    user: {
      id: user.id_utilisateur,
      apogee: user.apogee,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      solde: user.solde,
      code_qr: user.code_qr,
      role: "USER",
    },
    tokens: {
      accessToken ,
      refreshToken ,
    },
  };
};

module.exports = {
  loginUser,
};