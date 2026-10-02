const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");
const { validateRequest } = require("../../../middleware/validation.js");
const handleRegister = require("../../../../src/controllers/auth/registerController.js");
const {
  createUserSchema,
} = require("../../../../src/middleware/schemas/userSchema.js");

router.post(
  "/",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createUserSchema),
  handleRegister,
);

module.exports = router;
