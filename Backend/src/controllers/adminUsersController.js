const adminUsersService = require("../services/adminUsersService");
const AppError = require("../utils/AppError");

const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const users = await adminUsersService.getAllUsers(search);
    
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { apogee, nom, prenom, email, solde, password } = req.body;

    if (!apogee || !nom || !prenom || !email) {
      throw new AppError("Tous les champs (apogee, nom, prenom, email) sont obligatoires.", 400);
    }

    const newUserId = await adminUsersService.createUser({
      apogee, nom, prenom, email, solde, password
    });

    res.status(201).json({
      status: "success",
      message: "Utilisateur créé avec succès.",
      data: {
        id_utilisateur: newUserId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { apogee, nom, prenom, email, password } = req.body;

    if (!apogee || !nom || !prenom || !email) {
      throw new AppError("Les champs apogee, nom, prenom et email sont obligatoires.", 400);
    }

    await adminUsersService.updateUser(id, { apogee, nom, prenom, email, password });

    res.status(200).json({
      status: "success",
      message: "Utilisateur mis à jour avec succès.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await adminUsersService.deleteUser(id);

    res.status(200).json({
      status: "success",
      message: "Utilisateur supprimé avec succès.",
    });
  } catch (error) {
    next(error);
  }
};

const adjustBalance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body; // Can be positive or negative

    if (amount === undefined || isNaN(amount)) {
      throw new AppError("Le montant est invalide.", 400);
    }

    const result = await adminUsersService.updateUserBalance(id, amount);

    res.status(200).json({
      status: "success",
      message: "Solde ajusté avec succès.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  adjustBalance,
};
