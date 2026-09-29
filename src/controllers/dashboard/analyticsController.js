// /backend/controllers/dashboard/analyticsController.js
const Analytics = require("../../service/analytics.js");
const { convertToCSV } = require("../../utils/csv");

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
        const isExport = req.query.export === 'true';
        const result = await Analytics.getLockedTelegramLinks(req.query, isExport);

        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="locked-telegram-links.csv"');
            res.setHeader("Content-Type", "text/csv");
            return res.status(200).send(convertToCSV(result.data));
        }

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
        const isExport = req.query.export === 'true';
        const result = await Analytics.getBrokenLinks(req.query, isExport);

        if (isExport) {
            const server = req.query.serverName || 'server';
            res.setHeader("Content-Disposition", `attachment; filename="broken-links-${server}.csv"`);
            res.setHeader("Content-Type", "text/csv");
            return res.status(200).send(convertToCSV(result.data));
        }

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
        const isExport = req.query.export === 'true';
        const result = await Analytics.getMissingEpisodesByServer(req.query, isExport);

        if (isExport) {
            const server = req.query.serverName || 'server';
            res.setHeader("Content-Disposition", `attachment; filename="missing-episodes-${server}.csv"`);
            res.setHeader("Content-Type", "text/csv");
            return res.status(200).send(convertToCSV(result.data));
        }

        return res.status(200).json({
            success: true,
            message: `Missing episodes for server [${req.query.serverName}] retrieved successfully`,
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
        const isExport = req.query.export === 'true';
        const result = await Analytics.getNotReadyMedias(req.query, isExport);

        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="not-ready-medias.csv"');
            res.setHeader("Content-Type", "text/csv");
            return res.status(200).send(convertToCSV(result.data));
        }

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
    handleGetNotReadyMedias,
};
