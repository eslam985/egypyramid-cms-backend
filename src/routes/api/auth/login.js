const express = require("express");
const router = express.Router();

const handleLogin = require("../../../controllers/auth/loginController.js");
const { validateRequest } = require("../../../middleware/validation.js");
const { loginUserSchema } = require("../../../middleware/schemas/userSchema.js");

router.post("/", validateRequest(loginUserSchema),handleLogin); 

module.exports = router;
