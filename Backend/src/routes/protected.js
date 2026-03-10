const express = require("express");

const router = express.Router();
const verifyJwt = require("../middlewares/verifyJwt");

router.get("/me", verifyJwt, (req, res) => {
  res.json({
    status: "success",
    data: { user: req.user },
    message: "Access granted",
  });
});

module.exports = router;