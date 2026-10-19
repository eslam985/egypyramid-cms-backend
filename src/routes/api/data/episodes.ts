import express from "express";
const router = express.Router();

import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

import {
  createEpisodeSchema,
  updateEpisodeSchema,
  findEpisodesByMediaIdSchema,
} from "#src/middleware/schemas/episodeSchema.js";

import {
  handleCreateEpisode,
  handleUpdateEpisodeById,
  handleFindEpisodesBySeasonId,
  handleFindEpisodesByMediaId,
  handleFindEpisodeById,
  handleDeleteEpisodeById,
  handleFindAllEpisodes,
} from "#src/controllers/items/episodesController.js";

// --- 2. Episodes Routes ---
// Nested Episodes
// /api/medias/:media_id/episodes
router.get(
  "/media/:media_id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(findEpisodesByMediaIdSchema),
  handleFindEpisodesByMediaId,
);

router.post(
  "/media/:media_id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createEpisodeSchema),
  handleCreateEpisode,
);

// /api/medias/seasons/:season_id/episodes
router.get(
  "/season/:season_id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema("season_id")),
  handleFindEpisodesBySeasonId,
);

// 💡 تم وضع الروت هنا لحمايته ومنع تعارضه مع الـ :id
// جلب كل الحلقات وتصديرها (متاح عبر /api/episodes)

router.get("/", verifyRoles(ROLES_LIST.User), handleFindAllEpisodes);

// Single Item Episodes
// /api/medias/episodes/:id
router.get(
  "/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema()),
  handleFindEpisodeById,
);

router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(updateEpisodeSchema),
  handleUpdateEpisodeById,
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteEpisodeById,
);

export default router;
