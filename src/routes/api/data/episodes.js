


const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");

const {createIdParamSchema,}= require("../../../middleware/schemas/IDS_schema");

const {
    createEpisodeSchema,
    updateEpisodeSchema,
    findEpisodesByMediaIdSchema
} = require("../../../middleware/schemas/episodeSchema");
const { 
    handleCreateEpisode,
    handleUpdateEpisodeById,
    handleFindEpisodesBySeasonId,
    handleFindEpisodesByMediaId,
    handleFindEpisodeById,
    handleDeleteEpisodeById,
} = require("../../../controllers/items/episodesController");

// --- 2. Episodes Routes ---
// Nested Episodes
// /api/medias/:media_id/episodes
router.get("/media/:media_id", validateRequest(findEpisodesByMediaIdSchema), handleFindEpisodesByMediaId);
router.post("/media/:media_id", validateRequest(createEpisodeSchema), handleCreateEpisode);

// /api/medias/seasons/:season_id/episodes
router.get("/season/:season_id", validateRequest(createIdParamSchema("season_id")), handleFindEpisodesBySeasonId);

// Single Item Episodes
// /api/medias/episodes/:id
router.get("/:id", validateRequest(createIdParamSchema()), handleFindEpisodeById);
router.patch("/:id", validateRequest(updateEpisodeSchema), handleUpdateEpisodeById);
router.delete("/:id", validateRequest(createIdParamSchema()), handleDeleteEpisodeById);

module.exports = router;
