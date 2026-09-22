const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");
const {createIdParamSchema}= require("../../../middleware/schemas/IDS_schema");

const {
    createMediaSchema,
    updateMediaSchema,
    getMediasQuerySchema,
    getMediaByAnyId,
} = require("../../../middleware/schemas/mediaSchema");

const {
    handleCreateMedia,
    handleUpdateMedia,
    handleFindAllMedia,
    handleFindMediaById,
    handleDeleteMediaById,
    handleFindMediaByAnyId
} = require("../../../controllers/items/mediasController");


// --- 4. Media Routes ---
// Media Collection Routes
// /api/medias/
router.get("/", validateRequest(getMediasQuerySchema), handleFindAllMedia);
router.post("/", validateRequest(createMediaSchema), handleCreateMedia);

// Single Item Media Routes
// /api/medias/:id
router.get("/any-id/:id", validateRequest(getMediaByAnyId), handleFindMediaByAnyId);
router.get("/:id", validateRequest(createIdParamSchema()), handleFindMediaById);

router.patch("/:id", validateRequest(updateMediaSchema), handleUpdateMedia);
router.delete("/:id", validateRequest(createIdParamSchema()), handleDeleteMediaById);

module.exports = router;
