const bcrypt = require("bcrypt");
const crypto = require("crypto");

const db = require("../config/db");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const {
  findUserByApogee,
  findUserById,
  findUserByQrCode,
  findUserByEmail,
  updateUserPasswordById,
} = require("../models/userModel");
const { createRefreshToken , deleteExpiredTokens: deleteExpiredRefreshTokens,
  revokeAllUserRefreshTokens,} = require("../models/refreshTokenModel");
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
      accessToken,
      refreshToken,
    },
  };
};

const RESET_TOKEN_TTL_MINUTES = Number(
  process.env.RESET_TOKEN_TTL_MINUTES || 15
);

const forgotPassword = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  
  await deleteExpiredRefreshTokens();
  await passwordResetTokenModel.deleteExpiredTokens();

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

const resetPassword = async ({ token, newPassword, confirmPassword }) => {
  const cleanedToken = String(token || "").trim();

  if (!cleanedToken) {
    throw new AppError("Le token de réinitialisation est obligatoire", 400);
  }

  if (!newPassword || typeof newPassword !== "string") {
    throw new AppError("Le nouveau mot de passe est obligatoire", 400);
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    throw new AppError("La confirmation du mot de passe est obligatoire", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      "La confirmation du mot de passe ne correspond pas",
      400
    );
  }

  if (newPassword.length < 8) {
    throw new AppError(
      "Le nouveau mot de passe doit contenir au moins 8 caractères",
      400
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(cleanedToken)
    .digest("hex");

  const resetTokenRecord = await passwordResetTokenModel.findValidTokenByHash(
    tokenHash
  );

  if (!resetTokenRecord) {
    throw new AppError("Le token est invalide, expiré ou déjà utilisé", 400);
  }

  const user = await findUserById(resetTokenRecord.id_utilisateur);

  if (!user) {
    throw new AppError("Utilisateur introuvable", 404);
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await updateUserPasswordById(
      connection,
      user.id_utilisateur,
      newPasswordHash
    );

    await passwordResetTokenModel.markTokenAsUsed(
      connection,
      resetTokenRecord.id_reset_token
    );

    await passwordResetTokenModel.revokeOtherActiveTokensForUser(
      connection,
      user.id_utilisateur
    );

    await revokeAllUserRefreshTokens(connection, user.id_utilisateur);

    await connection.commit();

    return {
      user: {
        id: user.id_utilisateur,
        apogee: user.apogee,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const changePassword = async ({
  userId,
  oldPassword,
  newPassword,
  confirmPassword,
}) => {
  if (!userId) {
    throw new AppError("Utilisateur non authentifié", 401);
  }

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new AppError("Tous les champs mot de passe sont obligatoires", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      "La confirmation du nouveau mot de passe est invalide",
      400
    );
  }

  if (oldPassword === newPassword) {
    throw new AppError(
      "Le nouveau mot de passe doit être différent de l'ancien",
      400
    );
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("Utilisateur introuvable", 404);
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

  const isOldPasswordValid = await bcrypt.compare(
    oldPassword,
    user.mot_de_passe_hash
  );

  if (!isOldPasswordValid) {
    throw new AppError("Ancien mot de passe incorrect", 400);
  }

  const newPasswordHash = await bcrypt.hash(
    newPassword,
    saltRounds
  );

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const updated = await updateUserPasswordById(
      connection,
      userId,
      newPasswordHash
    );

    if (!updated) {
      throw new AppError("Impossible de modifier le mot de passe", 500);
    }

    await revokeAllUserRefreshTokens(connection, user.id_utilisateur);

    await connection.commit();

    return {};
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
  resetPassword,
  changePassword,
};