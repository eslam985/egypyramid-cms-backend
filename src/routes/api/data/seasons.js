import express from "express";
const router = express.Router();

import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

import {
  createSeasonSchema,
  updateSeasonSchema,
} from "#src/middleware/schemas/seasonSchema.ts";

import {
  handleCreateSeason,
  handleUpdateSeason,
  handleFindSeasonById,
  handleFindSeasonsByMediaId,
  handleDeleteSeasonById,
  handleFindAllSeasons,
} from "#src/controllers/items/seasonsController.js";
// /api/seasons"

// GET & POST /api/seasons/media/:media_id (جلب وإضافة مواسم لميديا معينة)
router.get(
  "/media/:media_id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema("media_id")),
  handleFindSeasonsByMediaId,
);

router.post(
  "/media/:media_id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createSeasonSchema),
  handleCreateSeason,
);

router.get("/", handleFindAllSeasons);

// Single Item Seasons: /api/seasons/:id
router.get(
  "/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema()),
  handleFindSeasonById,
);

router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(updateSeasonSchema),
  handleUpdateSeason,
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteSeasonById,
);

export default router;
