const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation");
const {
  createIdParamSchema,
} = require("../../../middleware/schemas/IDS_schema");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");
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
  handleFindAllSeasons,
} = require("../../../controllers/items/seasonsController");
// /api/seasons"

// GET & POST /api/seasons/media/:media_id (جلب وإضافة مواسم لميديا معينة)
router.get(
  "/media/:media_id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema("media_id")),
  handleFindSeasonsByMediaId,
);

router.post(
  "/media/:media_id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createSeasonSchema),
  handleCreateSeason,
);

router.get("/", handleFindAllSeasons);

// Single Item Seasons: /api/seasons/:id
router.get(
  "/:id",
  verifyRoles(ROLES_LIST.User),
  validateRequest(createIdParamSchema()),
  handleFindSeasonById,
);

router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(updateSeasonSchema),
  handleUpdateSeason,
);

router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteSeasonById,
);

module.exports = router;
