const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");
const {
  createIdParamSchema,
} = require("../../../middleware/schemas/IDS_schema");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");
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
  handleFindMediaByAnyId,
} = require("../../../controllers/items/mediasController");

// --- 4. Media Routes ---
// Media Collection Routes
// /api/medias/

router.get(
  "/",
  verifyRoles(ROLES_LIST.User),
  validateRequest(getMediasQuerySchema),
  handleFindAllMedia,
);

router.get(
  "/export",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(getMediasQuerySchema),
  handleFindAllMedia,
);

router.post(
  "/",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createMediaSchema),
  handleCreateMedia,
);

// Single Item Media Routes
// /api/medias/:id
router.get(
  "/any-id/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(getMediaByAnyId),
  handleFindMediaByAnyId,
);

router.get(
  "/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema()),
  handleFindMediaById,
);

router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(updateMediaSchema),
  handleUpdateMedia,
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteMediaById,
);

module.exports = router;
