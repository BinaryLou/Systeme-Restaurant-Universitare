const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const { findUserByApogee ,findUserById ,findUserByQrCode, findUserByEmail } = require("../models/userModel");
const { createRefreshToken } = require("../models/refreshTokenModel");
const passwordResetTokenModel = require("../models/passwordResetTokenModel");
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

const RESET_TOKEN_TTL_MINUTES = Number(process.env.RESET_TOKEN_TTL_MINUTES || 15);

const forgotPassword = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  // Toujours retourner un message générique
  if (!user) {
    return {
      dev_reset_token: null,
      expires_at: null,
    };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await passwordResetTokenModel.deleteTokensForUser(
      connection,
      user.id_utilisateur
    );

    await passwordResetTokenModel.createResetToken(
      connection,
      user.id_utilisateur,
      tokenHash,
      expiresAt
    );

    await connection.commit();

    return {
      dev_reset_token:
        process.env.NODE_ENV !== "production" ? rawToken : null,
      expires_at: expiresAt.toISOString(),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  loginUser,
  forgotPassword,
};