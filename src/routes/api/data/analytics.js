const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation.js");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");
const {
  getTotalBrokenAndValidAndPendingLinksSchema,
  getMissingEpisodesByServerSchema,
  getBrokenLinksSchema,
} = require("../../../middleware/schemas/analyticsSchema.js");

const {
  paginationSchema,
} = require("../../../middleware/schemas/paginationSchema.js");

const {
  handleGetSystemCounters,
  handleGetTotalBrokenAndValidAndPendingLinks,
  handleGetLockedTelegramLinks,
  handleGetBrokenLinks,
  handleGetMissingEpisodesByServer,
  handleGetNotReadyMedias,
} = require("../../../controllers/dashboard/analyticsController.js");

// 1. general

router.get(
  "/system-counters",
  verifyRoles(ROLES_LIST.User),
  handleGetSystemCounters,
);

// 2. Links Analytics
router.get(
  "/links/status/total",
  verifyRoles(ROLES_LIST.User),
  validateRequest(getTotalBrokenAndValidAndPendingLinksSchema),
  handleGetTotalBrokenAndValidAndPendingLinks,
);
router.get(
  "/links/telegram/locked",
  verifyRoles(ROLES_LIST.User),
  validateRequest(paginationSchema),
  handleGetLockedTelegramLinks,
);
router.get(
  "/links/broken",
  verifyRoles(ROLES_LIST.User),
  validateRequest(getBrokenLinksSchema),
  handleGetBrokenLinks,
);

// 3. episodes
router.get(
  "/episodes/links/missing-by-server",
  verifyRoles(ROLES_LIST.User),
  validateRequest(getMissingEpisodesByServerSchema),
  handleGetMissingEpisodesByServer,
);

// 5. Medias Analytics
router.get(
  "/medias/not-ready",
  verifyRoles(ROLES_LIST.User),
  validateRequest(paginationSchema),
  handleGetNotReadyMedias,
);

module.exports = router;
