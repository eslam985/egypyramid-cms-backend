// /egyPyramidDashbord/backend/controllers/items/mediasController.js
const Media = require("../../service/media.js");

const handleCreateMedia = async (req, res, next) => {
    try {
        const { genres, ...mediaData } = req.body;

        const result = await Media.createMedia(mediaData, genres || []);

        return res.status(201).json({
            success: true,
            message: `Media [${result.data.title}] Created Successfully!`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

const handleUpdateMedia = async (req, res, next) => {
    try {
        const mediaId = req.params.id;

        // 2. فصل genres عن باقي حقول الميديا
        const { genres, ...mediaData } = req.body;
        
        // 3. التحديث المباشر
        const result = await Media.updateMediaById( mediaId, { media: mediaData, genres,} ); 

        if (!result) 
            return res.status(404).json( { success: false, message: `Media Id ${mediaId} Not Found` } );

        return res.status(200).json({
            success: true,
            message: `Media ID ${mediaId} updated successfully`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

// findAllMedia({category, page = 1, limit = 20, search})
const handleFindAllMedia = async (req, res, next) => {
    try {
        const result = await Media.findAllMedia(req.query);
        
        return res.status(200).json({
            success: true,
            message: `Found ${result.data.length} Media(s)`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

// findMediaById(mediaId)
const handleFindMediaById = async (req, res, next) => {
    try {
        const mediaId = req.params.id;

        const result = await Media.findMediaById(mediaId);
        if (!result) 
            return res.status(404).json( { success: false, message: "Media not found" } );

        return res.status(200).json({
            success: true,
            message: `Media ID ${mediaId} Founded successfully!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

const handleFindMediaByAnyId = async (req, res, next) => {
    try {
        const id = req.params.id;
        const targetTable = req.query.targetTable || null; // اختياري لاستغلال الميزة الجديدة
        
        const result = await Media.findMediaByAnyId(id, targetTable);
        
        if (!result || result.length === 0) 
            return res.status(404).json({ success: false, message: `Media Id ${id} not found` });

        return res.status(200).json({
            success: true,
            message: `Media ID ${id} Founded successfully!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// deleteMediaById(id)
const handleDeleteMediaById = async (req, res, next) => {
    try {
        const mediaId = req.params.id;
        
        const result = await Media.deleteMediaById(mediaId);
        if (!result) 
            return res.status(404).json( { success: false, message: "Media not found or already deleted" } );

        return res.status(200).json({
            success: true,
            message: `Media ID ${mediaId} deleted successfully`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleCreateMedia,
    handleUpdateMedia,
    handleFindAllMedia,
    handleFindMediaById,
    handleDeleteMediaById,
    handleFindMediaByAnyId
};
