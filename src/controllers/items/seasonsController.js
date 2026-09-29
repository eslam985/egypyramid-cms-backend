const Season = require("../../service/season.js");
const { convertToCSV } = require("../../utils/csv");

//  createSeason(media_id, season_number)
const handleCreateSeason = async (req, res, next) => {
    try {
        const seasonNumber = req.body.season_number;
        const mediaId = req.params.media_id;

        const result = await Season.createSeason(mediaId, seasonNumber);

        return res.status(201).json({
            success: true,
            message: `Season Number ${seasonNumber} Created!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

//  updateSeasonById(id, season_number)
const handleUpdateSeason = async (req, res, next) => {
    try {
        const seasonId = req.params.id;
        const seasonNumber = req.body.season_number;

        const result = await Season.updateSeasonById(seasonId, seasonNumber);

        // 2. التحقق من نتيجة التحديث المباشر
        if (!result) 
            return res.status(404).json( { success: false,message: "Season not found" } );

        // 3. استجابة نجاح موحدة
        return res.status(200).json({
        success: true,
        message: `Season ID ${seasonId} updated successfully`,
        data: result,
        });
    } catch (err) {
        next(err); 
    }
};

// findSeasonById(id)
const handleFindSeasonById = async (req, res, next) => {
    try {
        const seasonId = req.params.id;

        // 2- check if column exists in db (id, season_number)
        const result = await Season.findSeasonById(seasonId);
        if (!result)
            return res.status(404).json( { success: false, message: "Season not found" } );

        // 3- last step: send details to response
        return res.status(200).json({
            success: true,
            message: `Season ID ${seasonId} Found!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// findSeasonsByMediaId(media_id)
const handleFindSeasonsByMediaId = async (req, res, next) => {
    try {
        // 2- check if column valid Is Number and Interger and not 0 ?!
        const mediaId = req.params.media_id;

        const result = await Season.findSeasonsByMediaId(mediaId);
        if (!result)
            return res.status(404).json( { success: false, message: "media Id not found" } );

        // 4- last step: send details to response
        res.status(200).json({
            success: true,
            message: `Found ${result.length} season(s)`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

//  deleteSeasonById(id)
const handleDeleteSeasonById = async (req, res, next) => {
    try {
        // 1- check if column valid Is Number and Interger and not 0 ?!
        const seasonId = req.params.id;

        const result = await Season.deleteSeasonById(seasonId);
        if (!result)
            return res.status(404).json( { success: false, message: "Season not found" } );

        return res.status(200).json({
            success: true,
            message: `Season Id ${seasonId} Deleted!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

const handleFindAllSeasons = async (req, res, next) => {
    try {
        // 1. فحص هل الريكويست يطلب تصدير البيانات (Export)
        const isExport = req.query.export === 'true';

        // 2. استدعاء السيرفيس وتمرير الـ query والـ isExport
        const seasons = await Season.findAllSeasons(req.query, isExport);
        
        // 3. إذا كان تصدير، نرسل البيانات كملف CSV فوراً
        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="seasons-export.csv"');
            res.setHeader("Content-Type", "text/csv");
            
            const csvData = convertToCSV(seasons); 
            return res.status(200).send(csvData);
        }

        // 4. الرد الطبيعي المعتاد في مشروعك لو كان ريكويست عادي للجدول
        return res.status(200).json({
            success: true,
            message: `Found ${seasons.length} Season(s)`,
            data: seasons
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleCreateSeason,
    handleUpdateSeason,
    handleFindSeasonById,
    handleFindSeasonsByMediaId,
    handleDeleteSeasonById,
    handleFindAllSeasons
};
