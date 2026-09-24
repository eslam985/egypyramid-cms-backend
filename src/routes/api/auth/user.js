const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation.js");
const { createIdParamSchema } = require('../../../middleware/schemas/IDS_schema.js')
const {
  updateUserByIdSchema,
  changePasswordSchema,
} = require("../../../middleware/schemas/userSchema.js");
const {
  handleChangePassword,
  handleUpdateUserInfo,
  handleGetSessionsByUserId,
  handleRemoveSessionById
} = require("../../../controllers/auth/userController");

router.put("/update/info", validateRequest(updateUserByIdSchema), handleUpdateUserInfo);
router.put("/update/password", validateRequest(changePasswordSchema), handleChangePassword);
router.get("/sessions", handleGetSessionsByUserId);
router.delete("/delete/session", validateRequest(createIdParamSchema('sessionId')), handleRemoveSessionById);

module.exports = router;
