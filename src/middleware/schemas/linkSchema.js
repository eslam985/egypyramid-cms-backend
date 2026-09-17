const { z } = require("zod");

const { createIdParamSchema } = require("./IDS_schema");

// createLink(episode_id, data = {})
const createLinkSchema = z.object({
    params: createIdParamSchema("episode_id").shape.params,
    body: z.object({
        server_name: z.string().trim().min(2).max(50),
        url: z.string().trim().url(),
        is_fixed: z.boolean().optional(),
        check_count: z.number().int().nonnegative().optional(),
        last_check_status: z.enum(["pending", "valid", "broken"]).optional(),
        link_type: z.enum(["watch", "download"]).optional(),
        quality: z.enum(["1080p", "720p", "480p", "360p", "4k"]).optional(),
    }),
});

// updateLinkById(id, data = {})
const updateLinkByIdSchema = z.object({
    params: createIdParamSchema("id").shape.params, // تعديل id إلى params
    body: createLinkSchema.shape.body.partial().refine(
        (data) => Object.keys(data).length > 0, 
        { message: "يجب إرسال حقل واحد على الأقل للتحديث" }
    ),
});

module.exports = {
    createLinkSchema,
    updateLinkByIdSchema,
}