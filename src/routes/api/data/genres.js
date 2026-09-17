// /backend/routes/api/genres.js
const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");
const {createIdParamSchema}= require("../../../middleware/schemas/IDS_schema");
const {
    createGenreSchema, 
    updateGenreByIdSchema, 
    findGenreByNameSchema
} = require("../../../middleware/schemas/genreSchema");
const {
    handleCreateGenre,
    handleUpdateGenreById,
    handleDeleteGenreById,
    handleFindAllGenres,
    handleFindGenreById,
    handleFindGenreByName,
} = require("../../../controllers/items/genreController")

// Genre
// /api/genres/search
router.get("/search", validateRequest(findGenreByNameSchema), handleFindGenreByName);

// /api/genres/
router.get("/", handleFindAllGenres);
router.post("/", validateRequest(createGenreSchema), handleCreateGenre);

// /api/genres/:id
router.get("/:id", validateRequest(createIdParamSchema()), handleFindGenreById);
router.patch("/:id", validateRequest(updateGenreByIdSchema), handleUpdateGenreById);
router.delete("/:id", validateRequest(createIdParamSchema()), handleDeleteGenreById);

module.exports = router;
