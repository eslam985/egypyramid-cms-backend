// /backend/controllers/dashboard/analyticsController.js
const Analytics = require("../../service/analytics.js");

// 1. general
// getSystemCounters()
const handleGetSystemCounters = async (req, res, next) => {
    try {
        const result = await Analytics.getSystemCounters();

        return res.status(200).json({
            success: true,
            message: "System counters retrieved successfully",
            data: result || {}
        });
    } catch (err) {
        next(err);
    }
};

// 2. Links Analytics
// getTotalBrokenAndValidAndPendingLinks(status)
const handleGetTotalBrokenAndValidAndPendingLinks = async (req, res, next) => {
    try {
        const { status } = req.query;
        const result = await Analytics.getTotalBrokenAndValidAndPendingLinks(status);

        return res.status(200).json({
            success: true,
            message: `Links count for status [${status}] retrieved successfully`,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

// getLockedTelegramLinks({ page = 1, limit = 20 })
const handleGetLockedTelegramLinks = async (req, res, next) => {
    try {
        const result = await Analytics.getLockedTelegramLinks(req.query);

        return res.status(200).json({
            success: true,
            message: `Found ${result.data.length} Locked By Server Name Telegram Direct`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

// getBrokenLinks({ page = 1, limit = 20 })
const handleGetBrokenLinks = async (req, res, next) => {
    try {
        const result = await Analytics.getBrokenLinks(req.query);

        return res.status(200).json({
            success: true,
            message: `Found ${result.data.length} Links Broken`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};


// 3. episodes
// getMissingEpisodesByServer({serverName, page = 1, limit = 20 })
const handleGetMissingEpisodesByServer = async (req, res, next) => {
    try {
        const result = await Analytics.getMissingEpisodesByServer(req.query);

        return res.status(200).json({
            success: true,
            message: `Missing episodes for server [${req.query.serverName}] retrieved successfully`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

// 4. Tasks Analytics
// getTasksByStatus({status, page = 1, limit = 20 })
const handleGetTasksByStatus = async (req, res, next) => {
    try {
        const result = await Analytics.getTasksByStatus(req.query);

        return res.status(200).json({
            success: true,
            message: `Tasks for status [${req.query.status}] retrieved successfully`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};


// 5. Medias Analytics
// getNotReadyMedias({ page = 1, limit = 20 })
const handleGetNotReadyMedias = async (req, res, next) => {
    try {
        const result = await Analytics.getNotReadyMedias(req.query);

        return res.status(200).json({
            success: true,
            message: `Found ${result.data.length} Media Not Ready`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleGetSystemCounters,
    handleGetTotalBrokenAndValidAndPendingLinks,
    handleGetLockedTelegramLinks,
    handleGetBrokenLinks,
    handleGetMissingEpisodesByServer,
    handleGetTasksByStatus,
    handleGetNotReadyMedias,
};
