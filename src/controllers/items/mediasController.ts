// /egyPyramidDashbord/backend/controllers/items/mediasController.js
import convertToCSV from "#src/utils/csv.js";
import Media from "#src/service/media.js";

import type { RequestHandler } from "express";

import { MediasResponse, MediaGenreResponse, FindMediaByAnyIdResponse} from '#src/types/mediaType.js'
import { CreateMediaType, BaseMediasQueryType } from '#src/middleware/schemas/mediaSchema.js'
import { PaginationResponse } from '#src/types/globalTypes.js'

import {  toNumber } from "#src/utils/paramAndQueryHelpes.js";
import { CustomError } from "#src/utils/customErr.js";

const handleCreateMedia: RequestHandler = async (req, res, next) => {
    try {
        const { genres, ...mediaData }: CreateMediaType = req.body;

        const result: { data: MediasResponse; } = await Media.createMedia(mediaData, genres || []);

        res.status(201).json({
            success: true,
            message: `Media [${result.data.title}] Created Successfully!`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

const handleUpdateMedia: RequestHandler = async (req, res, next) => {
    try {
      const id: number | null = toNumber(req.params.id);
      
      if (!id) throw new CustomError('Media id Undefined! ', 400)

      const { genres, ...mediaData } = req.body;

      const result: { data: { media: MediasResponse | null; genreResult: MediaGenreResponse[]; } } =
        await Media.updateMediaById( id, { media: mediaData, genres,}); 


      if (!result) {
        res.status(404).json( { success: false, message: `Media Id ${id} Not Found` } );
        return
      }
          

      res.status(200).json({
          success: true,
          message: `Media ID ${id} updated successfully`,
          ...result
      });
    } catch (err) {
        next(err);
    }
};

// findAllMedia({category, page = 1, limit = 20, search})
const handleFindAllMedia: RequestHandler = async (req, res, next) => {
    try {
        const isExport: boolean = req.query.export === 'true';

        const result: { data: MediasResponse[]; pagination: PaginationResponse; } = 
          await Media.findAllMedia(req.query as unknown as BaseMediasQueryType , isExport);
        
        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="medias-export.csv"');
            res.setHeader("Content-Type", "text/csv");
            
            const csvData = convertToCSV(result.data); 
            res.status(200).send(csvData);
            return
        }

        res.status(200).json({
            success: true,
            message: `Found ${result.data.length} Media(s)`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};


const handleFindMediaById: RequestHandler = async (req, res, next) => {
    try {
      const id: number | null = toNumber(req.params.id);
      
      if (!id) throw new CustomError('Media id Undefined! ', 400)

      const result: MediasResponse | null = await Media.findMediaById(id);

      if (!result) {
        res.status(404).json( { success: false, message: "Media not found" } );
        return
      }

      res.status(200).json({
          success: true,
          message: `Media ID ${id} Founded successfully!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};

const handleFindMediaByAnyId: RequestHandler = async (req, res, next) => {
    try {
      const id: number | null = toNumber(req.params.id);
      
      if (!id) throw new CustomError('Media id Undefined! ', 400)

      const targetTable = req.query.targetTable ?? null; 

      const result: FindMediaByAnyIdResponse[] = await Media.findMediaByAnyId(id, targetTable as unknown as null);

      if (!result || result.length === 0) {
        res.status(404).json({ success: false, message: `Id ${id} not found` });
        return
      }

      res.status(200).json({
          success: true,
          message: `Found ${result.length} Media successfully!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};

// deleteMediaById(id)
const handleDeleteMediaById: RequestHandler = async (req, res, next) => {
    try {
      const id: number | null = toNumber(req.params.id);
      
      if (!id) throw new CustomError('Media id Undefined! ', 400)

      const result: number | null = await Media.deleteMediaById(id);

      if (!result) {
        res.status(404).json( { success: false, message: "Media not found or already deleted" } );
        return
      }

      res.status(200).json({
          success: true,
          message: `Media ID ${id} deleted successfully`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};

export {
    handleCreateMedia,
    handleUpdateMedia,
    handleFindAllMedia,
    handleFindMediaById,
    handleDeleteMediaById,
    handleFindMediaByAnyId
};
