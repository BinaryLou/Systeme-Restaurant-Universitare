// TEST ROUTE
const express = require("express");
const verifyJWT = require("../middlewares/verifyJwt");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.get("/dashboard", verifyJWT, requireRole("ADMIN"), (req, res) => {
  return res.status(200).json({
    status: "success",
    data: {
      userId: req.user,
      role: req.role,
    },
    message: "Welcome admin",
  });
});

module.exports = router;