// backend/middleware/schemas/analyticsSchema.js
const { z } = require("zod");
const {
    paginationSchema,
} = require("./paginationSchema");

const getTotalBrokenAndValidAndPendingLinksSchema = z.object({
    query: z.object({
        status: z.enum(["valid", "broken", "pending"]),
    }),
});


const getMissingEpisodesByServerSchema = z.object({
    query: paginationSchema.shape.query.extend({
        serverName: z.string().trim().min(2).max(50),
    }),
});


const getBrokenLinksSchema = z.object({
    query: paginationSchema.shape.query.extend({
        serverName: z.string().trim().min(2).max(50),
    }),
});

module.exports = {
    getTotalBrokenAndValidAndPendingLinksSchema,
    getMissingEpisodesByServerSchema,
    getBrokenLinksSchema,
};
