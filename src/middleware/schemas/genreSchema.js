const { z } = require("zod");
const { createIdParamSchema } = require("./IDS_schema");


// createGenre
const createGenreSchema = z.object({ 
    body: z.object( { name: z.string().trim().min(2).max(20) } ) 
} );


const updateGenreByIdSchema = z.object({
    params: createIdParamSchema().shape.params,
    body: createGenreSchema.shape.body.partial().refine(
            (data) => Object.keys(data).length > 0, 
            {  message: "يجب إرسال حقل واحد على الأقل للتحديث", }
        ),
});

const findGenreByNameSchema = z.object({
    query: z.object({ name: z.string().trim().min(2).max(20) } ),
});

module.exports = { 
    createGenreSchema, 
    updateGenreByIdSchema, 
    findGenreByNameSchema 
};
