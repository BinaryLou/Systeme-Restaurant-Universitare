const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const { findUserByApogee } = require("../models/userModel");
const { createRefreshToken } = require("../models/refreshTokenModel");

const loginUser = async ({ apogee, password }) => {
  if (!apogee || !password) {
    const err = new Error("Code Apogée et mot de passe sont obligatoires");
    err.statusCode = 400;
    throw err;
  }

  const user = await findUserByApogee(apogee);

  if (!user) {
    const err = new Error("Identifiants invalides");
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.mot_de_passe_hash
  );

  if (!isPasswordValid) {
    const err = new Error("Identifiants invalides");
    err.statusCode = 401;
    throw err;
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
      role: "USER",
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

module.exports = {
  loginUser,
};