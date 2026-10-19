// backend/src/routes/api/auth/avatar.js

import express from "express";
const router = express.Router();

import { validateFile, validateRequest } from "#src/middleware/validation.js";
import upload from "#src/middleware/uploadMiddleware.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import {
  handleUploadAvatar,
  handleDeleteAvatar,
  handleSetAvatarFromHistory,
} from "#src/controllers/auth/avatarController.js";

import {
  uploadAvatarSchema,
  setAvatarFromHistorySchema,
} from "#src/middleware/schemas/avatarSchema.js";

router.post(
  "/",
  verifyRoles(ROLES_LIST.User),
  upload.single("profileImage"),
  validateFile(uploadAvatarSchema),
  handleUploadAvatar,
);

router.delete("/", verifyRoles(ROLES_LIST.User), handleDeleteAvatar);

router.patch(
  "/set-previous",
  verifyRoles(ROLES_LIST.User),
  validateRequest(setAvatarFromHistorySchema),
  handleSetAvatarFromHistory,
);

export default router;
