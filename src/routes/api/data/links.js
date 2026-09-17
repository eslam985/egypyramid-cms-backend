const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");
const {createIdParamSchema}= require("../../../middleware/schemas/IDS_schema");
const {
    createLinkSchema,
    updateLinkByIdSchema,
} = require("../../../middleware/schemas/linkSchema");
const {
	handleCreateLink,
	handleUpdateLinkById,
	handleFindLinkByEpisodeId,
	handleDeleteLinkById,
    handleFindLinkById,
} = require("../../../controllers/items/linksController");

// GET & POST /api/links/episode/:episode_id
router.get("/episode/:episode_id", validateRequest(createIdParamSchema("episode_id")), handleFindLinkByEpisodeId);
router.post("/episode/:episode_id", validateRequest(createLinkSchema), handleCreateLink);

// Single Item Links: /api/links/:id
router.patch("/:id", validateRequest(updateLinkByIdSchema), handleUpdateLinkById);
router.delete("/:id", validateRequest(createIdParamSchema()), handleDeleteLinkById);
router.get("/:id", validateRequest(createIdParamSchema()), handleFindLinkById);
module.exports = router;
