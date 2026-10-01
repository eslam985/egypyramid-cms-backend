const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");

const {
  createIdParamSchema,
} = require("../../../middleware/schemas/IDS_schema");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");
const {
  createEpisodeSchema,
  updateEpisodeSchema,
  findEpisodesByMediaIdSchema,
} = require("../../../middleware/schemas/episodeSchema");
const {
  handleCreateEpisode,
  handleUpdateEpisodeById,
  handleFindEpisodesBySeasonId,
  handleFindEpisodesByMediaId,
  handleFindEpisodeById,
  handleDeleteEpisodeById,
  handleFindAllEpisodes,
} = require("../../../controllers/items/episodesController");

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

module.exports = router;
