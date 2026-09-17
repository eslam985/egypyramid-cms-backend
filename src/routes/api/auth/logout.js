const express = require("express");
const router = express.Router();
const handleLogout = require("../../../controllers/auth/logoutController.js");

router.post("/", handleLogout);

module.exports = router;
