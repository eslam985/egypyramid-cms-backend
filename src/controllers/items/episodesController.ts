import Episode from "#src/service/episode.js";
import convertToCSV from "#src/utils/csv.js";

import type { RequestHandler } from "express";

import { CreateEpisodeType, UpdateEpisodeType, BaseEpisodeQueryType } from '#src/middleware/schemas/episodeSchema.js'
import { EpisodeResponse } from '#src/types/episodeType.js'


import { strFromQueryOrParams, toNumber } from "#src/utils/paramAndQueryHelpes.js";
import { CustomError } from "#src/utils/customErr.js";

const handleCreateEpisode: RequestHandler = async (req, res, next) => {
    try {

      const mediaId = toNumber(strFromQueryOrParams(req.params.media_id));
      
      if(!mediaId) throw new CustomError('media Id Undefined! ', 400)

        const { season_id, episode_number, ...restBody }: CreateEpisodeType = req.body;

      const result: EpisodeResponse | null = await Episode.createEpisode(mediaId, {
          season_id: season_id ?? null,
          episode_number,
          ...restBody,
      });

      if(!result) {
        res.status(404).json({success: false, message: 'Media Id Not Found!'})
        return
      }

      res.status(201).json({
          success: true,
          message: `Episode Number ${episode_number} Created!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};


// updateEpisodeById(id, data)
const handleUpdateEpisodeById: RequestHandler = async (req, res, next) => {
    try {
      const id: number | null = toNumber(strFromQueryOrParams(req.params.id));
      
      if (!id) throw new CustomError('episode id Undefined! ', 400)

      const data: UpdateEpisodeType = req.body;

      const result: EpisodeResponse | null = await Episode.updateEpisodeById(id, data);

      if (!result){
        res.status(404).json({ success: false, message: "Episode not found" });
        return
      }

      res.status(200).json({
          success: true,
          message: `Episode ID ${id} Updated!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};

// findEpisodesBySeasonId(season_id)
const handleFindEpisodesBySeasonId: RequestHandler = async (req, res, next) => {
    try {
      const seasonId: number | null = toNumber(strFromQueryOrParams(req.params.season_id));
      
      if (!seasonId) throw new CustomError('season Id Undefined! ', 400)

      const result: EpisodeResponse[] = await Episode.findEpisodesBySeasonId(seasonId);

      res.status(200).json({
          success: true,
          message: `Found ${result.length} Episode(s)!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};
import { PageAndLimitType } from '#src/types/globalTypes.js'

const handleFindEpisodesByMediaId: RequestHandler = async (req, res, next) => {
    try {
      const mediaId = toNumber(strFromQueryOrParams(req.params.media_id));
      
      if (!mediaId) throw new CustomError('media Id Undefined! ', 400)

      const query : PageAndLimitType = req.query
      
      const result: EpisodeResponse[] = await Episode.findEpisodesByMediaId(mediaId, query);

      res.status(200).json({
          success: true,
          message: `Found ${result.length} Episode(s)!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};

//  findEpisodeById(id)
const handleFindEpisodeById: RequestHandler = async (req, res, next) => {
    try {
      const id = toNumber(strFromQueryOrParams(req.params.id));
      
      if (!id) throw new CustomError('episode id Undefined! ', 400)

      const result: EpisodeResponse | null = await Episode.findEpisodeById(id);

      if (!result){
        res.status(404).json({ success: false, message: `Not Found Episode Id ${id}` });
        return
      }

      res.status(200).json({
          success: true,
          message: `Found Episode Id ${id}`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};

//   async deleteEpisodeById(id)
const handleDeleteEpisodeById: RequestHandler = async (req, res, next) => {
    try {
      const id = toNumber(strFromQueryOrParams(req.params.id));
      
      if (!id) throw new CustomError('episode id Undefined! ', 400)

      const result: number | null = await Episode.deleteEpisodeById(id);

      if (!result) {
        res.status(404).json({ success: false, message: "Episode not found" });
        return
      }

      res.status(200).json({
          success: true,
          message: `Episode Id ${id} Deleted!`,
          data: result,
        });
    } catch (err) {
        next(err);
    }
};


const handleFindAllEpisodes: RequestHandler = async (req, res, next) => {
    try {
        const isExport: boolean = req.query.export === 'true';
        
        const query = req.query as unknown as BaseEpisodeQueryType

        const episodes: EpisodeResponse[] = await Episode.findAllEpisodes(query , isExport);
        
        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="episodes-export.csv"');
            res.setHeader("Content-Type", "text/csv");
            
            const csvData: string = convertToCSV(episodes); 
            res.status(200).send(csvData);
            return
        }

        res.status(200).json({
            success: true,
            message: `Found ${episodes.length} Episode(s)`,
            data: episodes
        });
    } catch (err) {
        next(err);
    }
};


export {
    handleCreateEpisode,
    handleUpdateEpisodeById,
    handleFindEpisodesBySeasonId,
    handleFindEpisodesByMediaId,
    handleFindEpisodeById,
    handleDeleteEpisodeById,
    handleFindAllEpisodes
};
