import express from "express";
const router = express.Router();

import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import {
  updateUserByIdSchema,
  changePasswordSchema,
  deleteSessionsBy_uuid,
  getSessionsQuerySchema,
} from "#src/middleware/schemas/userSchema.ts";

import {
  handleChangePassword,
  handleUpdateUserInfo,
  handleGetSessionsByUserId,
  handleRemoveSessionById,
  handleFindUserById,
} from "#src/controllers/auth/userController.js";

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
  validateRequest(getSessionsQuerySchema),
  handleGetSessionsByUserId,
);

router.get("/", verifyRoles(ROLES_LIST.User), handleFindUserById);

router.delete(
  "/delete/session",
  verifyRoles(ROLES_LIST.User),
  validateRequest(deleteSessionsBy_uuid),
  handleRemoveSessionById,
);

export default router;
