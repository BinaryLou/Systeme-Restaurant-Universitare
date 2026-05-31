const bcrypt = require("bcrypt");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const userModel = require("../models/userModel");

const getAllUsers = async (searchTerm) => {
  return await userModel.getAllUsers(searchTerm);
};

const createUser = async (userData) => {
  const { apogee, nom, prenom, email, solde, password } = userData;

  // Check if Apogee already exists
  const existingByApogee = await userModel.findUserByApogee(apogee);
  if (existingByApogee) {
    throw new AppError("Ce numéro Apogée est déjà utilisé.", 400);
  }

  // Check if email already exists
  const existingByEmail = await userModel.findUserByEmail(email);
  if (existingByEmail) {
    throw new AppError("Cet email est déjà utilisé.", 400);
  }

  // Generate a random QR code value
  const codeQr = crypto.randomBytes(16).toString("hex");

  // Default password is the Apogee code if password is not provided
  const salt = await bcrypt.genSalt(10);
  const passToHash = password && password.trim() !== "" ? password : apogee;
  const mot_de_passe_hash = await bcrypt.hash(passToHash, salt);

  const newUserId = await userModel.createUser({
    apogee,
    nom,
    prenom,
    email,
    mot_de_passe_hash,
    code_qr: codeQr,
    solde: solde || 0,
  });

  return newUserId;
};

const updateUser = async (id, userData) => {
  const { apogee, nom, prenom, email, password } = userData;

  const existingUser = await userModel.findUserById(id);
  if (!existingUser) {
    throw new AppError("Utilisateur introuvable.", 404);
  }

  // Si l'email change, vérifier qu'il n'est pas pris par quelqu'un d'autre
  if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
    const emailOwner = await userModel.findUserByEmail(email);
    if (emailOwner && emailOwner.id_utilisateur !== Number(id)) {
      throw new AppError("Cet email est déjà utilisé par un autre utilisateur.", 400);
    }
  }

  // Si le code Apogee change, vérifier qu'il n'est pas pris
  if (apogee && apogee !== existingUser.apogee) {
    const apogeeOwner = await userModel.findUserByApogee(apogee);
    if (apogeeOwner && apogeeOwner.id_utilisateur !== Number(id)) {
      throw new AppError("Ce numéro Apogée est déjà utilisé par un autre utilisateur.", 400);
    }
  }

  await userModel.updateUser(id, { apogee, nom, prenom, email });

  if (password && password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    const mot_de_passe_hash = await bcrypt.hash(password, salt);
    await userModel.updateUserPassword(id, mot_de_passe_hash);
  }

  return true;
};

const deleteUser = async (id) => {
  const existingUser = await userModel.findUserById(id);
  if (!existingUser) {
    throw new AppError("Utilisateur introuvable.", 404);
  }

  await userModel.deleteUser(id);
  return true;
};

const updateUserBalance = async (id, amount) => {
  const existingUser = await userModel.findUserById(id);
  if (!existingUser) {
    throw new AppError("Utilisateur introuvable.", 404);
  }

  const newBalance = Number(existingUser.solde) + Number(amount);
  if (newBalance < 0) {
    throw new AppError("Le solde ne peut pas être négatif.", 400);
  }

  await userModel.updateUserBalance(id, newBalance);
  
  return {
    oldBalance: existingUser.solde,
    newBalance: newBalance
  };
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserBalance,
};
