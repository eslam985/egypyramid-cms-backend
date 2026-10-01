const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation.js");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");

const {
  updateUserByIdSchema,
  changePasswordSchema,
  deleteSessionsBy_uuid,
} = require("../../../middleware/schemas/userSchema.js");

const {
  handleChangePassword,
  handleUpdateUserInfo,
  handleGetSessionsByUserId,
  handleRemoveSessionById,
  handleFindUserById,
} = require("../../../controllers/auth/userController");

router.put(
  "/update/info",
  verifyRoles(ROLES_LIST.User),
  validateRequest(updateUserByIdSchema),
  handleUpdateUserInfo,
);
router.put(
  "/update/password",
  verifyRoles(ROLES_LIST.User),
  validateRequest(changePasswordSchema),
  handleChangePassword,
);

router.get(
  "/sessions",
  verifyRoles(ROLES_LIST.User),
  handleGetSessionsByUserId,
);

router.get("/", verifyRoles(ROLES_LIST.User), handleFindUserById);

router.delete(
  "/delete/session",
  verifyRoles(ROLES_LIST.User),
  validateRequest(deleteSessionsBy_uuid),
  handleRemoveSessionById,
);

module.exports = router;
