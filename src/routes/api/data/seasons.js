const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");
const {createIdParamSchema}= require("../../../middleware/schemas/IDS_schema");

const {
    createSeasonSchema,
    updateSeasonSchema,
} = require("../../../middleware/schemas/seasonSchema");


const {
    handleCreateSeason,
    handleUpdateSeason,
    handleFindSeasonById,
    handleFindSeasonsByMediaId,
    handleDeleteSeasonById,
} = require("../../../controllers/items/seasonsController");
// /api/seasons"

// GET & POST /api/seasons/media/:media_id (جلب وإضافة مواسم لميديا معينة)
router.get("/media/:media_id", validateRequest(createIdParamSchema("media_id")), handleFindSeasonsByMediaId);
router.post("/media/:media_id", validateRequest(createSeasonSchema), handleCreateSeason);

// Single Item Seasons: /api/seasons/:id
router.get("/:id", validateRequest(createIdParamSchema()), handleFindSeasonById);
router.patch("/:id", validateRequest(updateSeasonSchema), handleUpdateSeason);
router.delete("/:id", validateRequest(createIdParamSchema()), handleDeleteSeasonById);

module.exports = router;