const express = require("express");
const router = express.Router();

const verifyJwt = require("../middlewares/verifyJwt");
const requireRole = require("../middlewares/requireRole");
const validateServicePayload = require("../middlewares/validateServicePayload");
const serviceController = require("../controllers/serviceController");

// GET /api/services
router.get(
  "/",
  verifyJwt,
  requireRole("ADMIN"),
  serviceController.getServices
);

// POST /api/services
router.post(
  "/",
  verifyJwt,
  requireRole("ADMIN"),
  validateServicePayload,
  serviceController.createService
);

// PUT /api/services/:id
router.put(
  "/:id",
  verifyJwt,
  requireRole("ADMIN"),
  validateServicePayload,
  serviceController.updateService
);

// DELETE /api/services/:id
router.delete(
  "/:id",
  verifyJwt,
  requireRole("ADMIN"),
  serviceController.deleteService
);

module.exports = router;