// /projects/project_Full-stack/egyPyramidDashbord/backend/model/schema.js
// backend/middleware/schemas/mediaSchema.js
const { z } = require("zod");
const { createIdParamSchema } = require("./IDS_schema");

const { durationIsoRegex, labelRe } = require("../../utils/regex");

const createMediaSchema = z.object({
    body: z.object({
        title: z.string().trim().min(3, "العنوان يجب ألا يقل عن 3 أحرف").max(100),
        year: z.string().trim().length(4),
        tmdb_id: z.string().trim().min(3).max(20).optional().nullable(),
        poster_url: z.string().trim().url("رابط البوستر غير صالح").optional().nullable(),
        story: z.string().trim().min(8).max(500).optional().nullable(),
        rating: z.string().trim().min(1).max(8).optional().nullable(),
        runtime: z.string().trim().min(3).max(30).optional().nullable(),
        is_ready: z.boolean().default(false),
        genres: z.array( z.coerce.number().int().positive() ).optional(),
        labels: z.string().trim().regex(labelRe, "التصنيفات يجب أن تكون كلمات مفصولة بفواصل").nullable().optional(),

        category: z.enum( ["movie", "tv"], 
            { errorMap: () => ( {  message: "النوع يجب أن يكون movie أو tv" } ), } ),

        media_type: z.enum( ["movie", "series"],
            { errorMap: () => ( {  message: "النوع يجب أن يكون movie أو series" } ) } ),

        duration_iso: z.string().trim().regex(
            durationIsoRegex, "صيغة duration_iso غير صحيحة (مثال: PT1H30M)"
        ).optional().nullable()
    }),
});

const updateMediaSchema = z.object({
        // فحص الـ ID في params
        params: createIdParamSchema().shape.params,

        // جعل الحقول اختيارية + اشتراط إرسال حقل واحد على الأقل
        body: createMediaSchema.shape.body.partial().refine(
                (data) => Object.keys(data).length > 0, 
                {  message: "يجب إرسال حقل واحد على الأقل للتحديث", } 
            ),
    });

const getMediasQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().max(100).default(10),
        search: z.string().trim().optional(),
        category: z.enum(["movie", "tv"]).optional(),
    }),
});

const getMediaByAnyId = z.object({
    params: createIdParamSchema().shape.params,
});

module.exports = {
    createMediaSchema,
    updateMediaSchema,
    getMediasQuerySchema,
    getMediaByAnyId,
};
