const express = require("express");
const adminUsersController = require("../controllers/adminUsersController");
const verifyJwt = require("../middlewares/verifyJwt");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

// All routes are protected by admin guard
router.use(verifyJwt, requireRole("ADMIN", "CAISSIER")); 

router.get("/", verifyJwt, requireRole("ADMIN"), adminUsersController.getAllUsers);
router.post("/", verifyJwt, requireRole("ADMIN"), adminUsersController.createUser);
router.put("/:id", verifyJwt, requireRole("ADMIN"), adminUsersController.updateUser);
router.delete("/:id", verifyJwt, requireRole("ADMIN"), adminUsersController.deleteUser);
router.patch("/:id/balance", verifyJwt, requireRole("ADMIN"), adminUsersController.adjustBalance);

module.exports = router;
