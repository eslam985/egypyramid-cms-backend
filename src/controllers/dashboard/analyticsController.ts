// /backend/controllers/dashboard/analyticsController.js
import Analytics from "#src/service/analytics.js";
import convertToCSV from "#src/utils/csv.js";

import type { RequestHandler } from "express";

import {
  SystemCountersResponse,
  TotalStatusLinksResponse,
  StatusLinksRequest,
} from "#src/types/analyticsType.js";
import type {
  GetMissingEpisodesByServerType,
  GetBrokenLinksType,
} from "#src/middleware/schemas/analyticsSchema.js";
import type { PageAndLimitType } from "#src/types/globalTypes.js";

// 1. general
// getSystemCounters()
const handleGetSystemCounters: RequestHandler = async (_req, res, next) => {
    try {
        const result: SystemCountersResponse = await Analytics.getSystemCounters();

        res.status(200).json({
            success: true,
            message: "System counters retrieved successfully",
            data: result || {}
        });
    } catch (err) {
        next(err);
    }
};

// 2. Links Analytics
const handleGetTotalBrokenAndValidAndPendingLinks: RequestHandler = async (req, res, next) => {
    try {
        const status: StatusLinksRequest = req.query.status as StatusLinksRequest ;

        const result: TotalStatusLinksResponse[] = await Analytics.getTotalBrokenAndValidAndPendingLinks(status);

        res.status(200).json({
            success: true,
            message: `Links count for status [${status}] retrieved successfully`,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const handleGetLockedTelegramLinks: RequestHandler = async (req, res, next) => {
    try {
        const isExport: boolean = req.query.export === 'true';

        const result = await Analytics.getLockedTelegramLinks(req.query, isExport);

        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="locked-telegram-links.csv"');
            res.setHeader("Content-Type", "text/csv");
            res.status(200).send(convertToCSV(result.data));
            return
        }

        res.status(200).json({
            success: true,
            message: `Found ${result.data.length} Locked By Server Name Telegram Direct`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

const handleGetBrokenLinks: RequestHandler = async (req, res, next) => {
    try {
        const isExport: boolean = req.query.export === 'true';
        const result = await Analytics.getBrokenLinks(req.query as unknown as GetBrokenLinksType["query"], isExport);

        if (isExport) {
            const server = req.query.serverName || 'server';
            res.setHeader("Content-Disposition", `attachment; filename="broken-links-${server}.csv"`);
            res.setHeader("Content-Type", "text/csv");
            res.status(200).send(convertToCSV(result.data));
            return
        }

        res.status(200).json({
            success: true,
            message: `Found ${result.data.length} Links Broken`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};


// 3. episodes
const handleGetMissingEpisodesByServer: RequestHandler = async (req, res, next) => {
    try {
        const isExport: boolean = req.query.export === 'true';
        const result = await Analytics.getMissingEpisodesByServer(req.query as unknown as GetMissingEpisodesByServerType["query"], isExport);

        if (isExport) {
            const server = req.query.serverName || 'server';
            res.setHeader("Content-Disposition", `attachment; filename="missing-episodes-${server}.csv"`);
            res.setHeader("Content-Type", "text/csv");
            res.status(200).send(convertToCSV(result.data));
            return
        }

        res.status(200).json({
            success: true,
            message: `Missing episodes for server [${req.query.serverName}] retrieved successfully`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};



// 5. Medias Analytics
const handleGetNotReadyMedias: RequestHandler = async (req, res, next) => {
    try {
        const isExport: boolean = req.query.export === 'true';
        const result = await Analytics.getNotReadyMedias(req.query as unknown as PageAndLimitType, isExport);

        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="not-ready-medias.csv"');
            res.setHeader("Content-Type", "text/csv");
            res.status(200).send(convertToCSV(result.data));
            return
        }

        res.status(200).json({
            success: true,
            message: `Found ${result.data.length} Media Not Ready`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};


export {
    handleGetSystemCounters,
    handleGetTotalBrokenAndValidAndPendingLinks,
    handleGetLockedTelegramLinks,
    handleGetBrokenLinks,
    handleGetMissingEpisodesByServer,
    handleGetNotReadyMedias,
};
