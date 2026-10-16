import express from "express";
const router = express.Router();

import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import { paginationSchema } from "#src/middleware/schemas/paginationSchema.js";

import {
  getTotalBrokenAndValidAndPendingLinksSchema,
  getMissingEpisodesByServerSchema,
  getBrokenLinksSchema,
} from "#src/middleware/schemas/analyticsSchema.ts";

import {
  handleGetSystemCounters,
  handleGetTotalBrokenAndValidAndPendingLinks,
  handleGetLockedTelegramLinks,
  handleGetBrokenLinks,
  handleGetMissingEpisodesByServer,
  handleGetNotReadyMedias,
} from "#src/controllers/dashboard/analyticsController.js";

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

export default router;
