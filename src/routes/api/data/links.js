import express from "express";
const router = express.Router();

import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

import {
  createLinkSchema,
  updateLinkByIdSchema,
} from "#src/middleware/schemas/linkSchema.ts";
import {
  handleCreateLink,
  handleUpdateLinkById,
  handleFindLinkByEpisodeId,
  handleDeleteLinkById,
  handleFindLinkById,
  handleFindAllLinks,
} from "#src/controllers/items/linksController.js";

// GET & POST /api/links/episode/:episode_id

router.get(
  "/episode/:episode_id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema("episode_id")),
  handleFindLinkByEpisodeId,
);

router.post(
  "/episode/:episode_id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createLinkSchema),
  handleCreateLink,
);

router.get("/", verifyRoles(ROLES_LIST.User), handleFindAllLinks);

// Single Item Links: /api/links/:id
router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(updateLinkByIdSchema),
  handleUpdateLinkById,
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteLinkById,
);

router.get(
  "/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema()),
  handleFindLinkById,
);

export default router;
