const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation.js");

const {
  updateUserByIdSchema,
  changePasswordSchema,
  deleteSessionsBy_uuid
} = require("../../../middleware/schemas/userSchema.js");
const {
  handleChangePassword,
  handleUpdateUserInfo,
  handleGetSessionsByUserId,
  handleRemoveSessionById,
  handleFindUserById
} = require("../../../controllers/auth/userController");

router.put("/update/info", validateRequest(updateUserByIdSchema), handleUpdateUserInfo);
router.put("/update/password", validateRequest(changePasswordSchema), handleChangePassword);

router.get("/sessions", handleGetSessionsByUserId);
router.get("/", handleFindUserById);

router.delete("/delete/session", validateRequest(deleteSessionsBy_uuid), handleRemoveSessionById);

module.exports = router;
