import convertToCSV from "#src/utils/csv.js";
import Season from "#src/service/season.js";

import type { RequestHandler } from "express";

import {BaseSeasonQueryType} from '#src/middleware/schemas/seasonSchema.js'
import { SeasonResponse } from '#src/types/seasonType.js'


import { toNumber } from "#src/utils/paramAndQueryHelpes.js";
import { CustomError } from "#src/utils/customErr.js";

const handleCreateSeason: RequestHandler = async (req, res, next) => {
    try {
      const mediaId: number | null = toNumber(req.params.media_id);
      
      if(!mediaId) throw new CustomError('media Id Undefined! ', 400)

      const seasonNumber: number = req.body.season_number;

      const result: SeasonResponse | null = await Season.createSeason(mediaId, seasonNumber);

      if(!result) {
        res.status(404).json({success: false, message: 'Media Id Not Found!'})
        return
      }

      res.status(201).json({
          success: true,
          message: `Season Number ${seasonNumber} Created!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};

const handleUpdateSeason: RequestHandler = async (req, res, next) => {
    try {
      const seasonId: number | null = toNumber(req.params.season_id);
      
      if (!seasonId) throw new CustomError('season Id Undefined! ', 400)

      const seasonNumber: number = req.body.season_number;

      const result: SeasonResponse | null = await Season.updateSeasonById(seasonId, seasonNumber);

      if (!result) {
        res.status(404).json( { success: false,message: "Season not found" } );
        return
      } 

      // 3. استجابة نجاح موحدة
      res.status(200).json({
        success: true,
        message: `Season ID ${seasonId} updated successfully`,
        data: result,
      });
    } catch (err) {
        next(err); 
    }
};

// findSeasonById(id)
const handleFindSeasonById: RequestHandler = async (req, res, next) => {
    try {
        const seasonId: number | null = toNumber(req.params.id);

        if (!seasonId) throw new CustomError('season Id Undefined!', 400)

        const result: SeasonResponse | null = await Season.findSeasonById(seasonId);

        if (!result) {
          res.status(404).json( { success: false, message: "Season not found" } );
          return
        }

        res.status(200).json({
            success: true,
            message: `Season ID ${seasonId} Found!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// findSeasonsByMediaId(media_id)
const handleFindSeasonsByMediaId: RequestHandler = async (req, res, next) => {
    try {
        const mediaId: string | string[] | undefined = req.params.media_id;
        const idNum: number = mediaId !== undefined && Array.isArray(mediaId) ? Number(mediaId[0]) : Number(mediaId);

        const result: SeasonResponse[] = await Season.findSeasonsByMediaId(idNum);

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
const handleDeleteSeasonById: RequestHandler = async (req, res, next) => {
    try {
      const seasonId: number | null = toNumber(req.params.season_id);
      
      if (!seasonId) throw new CustomError('season Id Undefined! ', 400)

      const result: number | null = await Season.deleteSeasonById(seasonId);

      if (!result){
        res.status(404).json( { success: false, message: "Season not found" } );
        return
      }
          

      res.status(200).json({
          success: true,
          message: `Season Id ${seasonId} Deleted!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};

const handleFindAllSeasons: RequestHandler = async (req, res, next) => {
    try {
        const isExport: boolean = req.query.export === 'true';

        const seasons: SeasonResponse[] = 
          await Season.findAllSeasons(req.query as unknown as BaseSeasonQueryType, isExport);
        
        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="seasons-export.csv"');
            res.setHeader("Content-Type", "text/csv");
            
            const csvData = convertToCSV(seasons); 
            res.status(200).send(csvData);
            return
        }

        res.status(200).json({
            success: true,
            message: `Found ${seasons.length} Season(s)`,
            data: seasons
        });
    } catch (err) {
        next(err);
    }
};

export {
    handleCreateSeason,
    handleUpdateSeason,
    handleFindSeasonById,
    handleFindSeasonsByMediaId,
    handleDeleteSeasonById,
    handleFindAllSeasons
};
