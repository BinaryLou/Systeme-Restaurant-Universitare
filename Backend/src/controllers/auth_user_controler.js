// src/controllers/authController.js
const { loginStudent } = require("../services/auth_user_service");

const studentLogin = async (req, res, next) => {
  try {
    const { apogee, password } = req.body;

    const result = await loginStudent({ apogee, password });

    return res.status(200).json({
      status: "success",
      message: "Connexion étudiant réussie",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  studentLogin,
};