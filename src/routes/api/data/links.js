const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");
const {
  createIdParamSchema,
} = require("../../../middleware/schemas/IDS_schema");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");
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
  handleFindAllLinks,
} = require("../../../controllers/items/linksController");

// GET & POST /api/links/episode/:episode_id

router.get(
  "/episode/:episode_id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema("episode_id")),
  handleFindLinkByEpisodeId,
);

router.post(
  "/episode/:episode_id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createLinkSchema),
  handleCreateLink,
);

router.get("/", verifyRoles(ROLES_LIST.User), handleFindAllLinks);

// Single Item Links: /api/links/:id
router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(updateLinkByIdSchema),
  handleUpdateLinkById,
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteLinkById,
);

router.get(
  "/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema()),
  handleFindLinkById,
);

module.exports = router;
