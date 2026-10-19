// /backend/routes/api/genres.js
import express from "express";
const router = express.Router();

import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import { createIdParamSchema } from "#src/middleware/schemas/IDS_schema.js";

import {
  updateGenreByIdSchema,
  findGenreByNameSchema,
  createGenreSchema,
} from "#src/middleware/schemas/genreSchema.js";

import {
  handleCreateGenre,
  handleUpdateGenreById,
  handleDeleteGenreById,
  handleFindAllGenres,
  handleFindGenreById,
  handleFindGenreByName,
} from "#src/controllers/items/genreController.js";

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

export default router;
