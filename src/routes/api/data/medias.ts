import express from "express";
const router = express.Router();

import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

import {
  createMediaSchema,
  updateMediaSchema,
  getMediasQuerySchema,
  getMediaByAnyId,
} from "#src/middleware/schemas/mediaSchema.js";

import {
  handleCreateMedia,
  handleUpdateMedia,
  handleFindAllMedia,
  handleFindMediaById,
  handleDeleteMediaById,
  handleFindMediaByAnyId,
} from "#src/controllers/items/mediasController.js";

// --- 4. Media Routes ---
// Media Collection Routes
// /api/medias/

router.get(
  "/",
  verifyRoles(ROLES_LIST.User),
  validateRequest(getMediasQuerySchema),
  handleFindAllMedia,
);

router.get(
  "/export",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(getMediasQuerySchema),
  handleFindAllMedia,
);

router.post(
  "/",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createMediaSchema),
  handleCreateMedia,
);

// Single Item Media Routes
// /api/medias/:id
router.get(
  "/any-id/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(getMediaByAnyId),
  handleFindMediaByAnyId,
);

router.get(
  "/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema()),
  handleFindMediaById,
);

router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(updateMediaSchema),
  handleUpdateMedia,
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteMediaById,
);

export default router;
