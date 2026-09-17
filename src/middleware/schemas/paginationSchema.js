///backend/middleware/schemas/paginationSchema.js
const { z } = require("zod");

// 1. السكيما الأساسية: للترقيم فقط (page, limit)
const paginationSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
    }),
});

// 2. السكيما الممتدة: للترقيم مع البحث (page, limit, search)
const searchPaginationSchema = z.object({
    query: paginationSchema.shape.query.extend({
        search: z.string().trim().optional(),
    }),
});

module.exports = {
    paginationSchema,
    searchPaginationSchema,
};