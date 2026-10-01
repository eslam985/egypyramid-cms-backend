// /backend/routes/api/genres.js
const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");
const {
  createIdParamSchema,
} = require("../../../middleware/schemas/IDS_schema");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");
const {
  createGenreSchema,
  updateGenreByIdSchema,
  findGenreByNameSchema,
} = require("../../../middleware/schemas/genreSchema");
const {
  handleCreateGenre,
  handleUpdateGenreById,
  handleDeleteGenreById,
  handleFindAllGenres,
  handleFindGenreById,
  handleFindGenreByName,
} = require("../../../controllers/items/genreController");

// Genre
// /api/genres/search
router.get(
  "/search",
  verifyRoles(ROLES_LIST.User),
  validateRequest(findGenreByNameSchema),
  handleFindGenreByName,
);

// /api/genres/

router.get("/", verifyRoles(ROLES_LIST.User), handleFindAllGenres);

router.post(
  "/",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createGenreSchema),
  handleCreateGenre,
);

// /api/genres/:id
router.get(
  "/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema()),
  handleFindGenreById,
);

router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(updateGenreByIdSchema),
  handleUpdateGenreById,
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteGenreById,
);

module.exports = router;
