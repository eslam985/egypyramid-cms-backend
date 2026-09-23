const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation.js");
const {
    getTotalBrokenAndValidAndPendingLinksSchema,
    getMissingEpisodesByServerSchema,
    getBrokenLinksSchema
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
router.get("/system-counters",handleGetSystemCounters,);

// 2. Links Analytics
router.get("/links/status/total",
    validateRequest(getTotalBrokenAndValidAndPendingLinksSchema),handleGetTotalBrokenAndValidAndPendingLinks,
);
router.get("/links/telegram/locked",validateRequest(paginationSchema),handleGetLockedTelegramLinks,);
router.get("/links/broken",validateRequest(getBrokenLinksSchema),handleGetBrokenLinks,);


// 3. episodes
router.get(
    "/episodes/links/missing-by-server",validateRequest(getMissingEpisodesByServerSchema),handleGetMissingEpisodesByServer,
);

// 5. Medias Analytics
router.get("/medias/not-ready",validateRequest(paginationSchema),handleGetNotReadyMedias,);

module.exports = router;
