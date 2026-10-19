import convertToCSV from "#src/utils/csv.js";
import Genre from "#src/service/genres.js";

import type { RequestHandler } from "express";

import { CreateAndUpdateGenreType } from '#src/middleware/schemas/genreSchema.js'
import { GenresResponse } from '#src/types/genreType.js'

import { strFromQueryOrParams, toNumber } from "#src/utils/paramAndQueryHelpes.js";
import { CustomError } from "#src/utils/customErr.js";

const handleCreateGenre: RequestHandler = async (req, res, next) => {
    try {
        const data: CreateAndUpdateGenreType = req.body;

        const result: GenresResponse = await Genre.createGenre(data);

        res.status(201).json({
            success: true,
            message: `Genre name '${result.name}' created successfully!`,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const handleUpdateGenreById: RequestHandler = async (req, res, next) => {
    try {

      const id: number | null = toNumber(strFromQueryOrParams(req.params.id));

      if(!id) throw new CustomError('Genre id Undefined! ', 400)

      const data: CreateAndUpdateGenreType = req.body;

      const result: GenresResponse | null = await Genre.updateGenreById(id, data);

      if(!result) {
        res.status(404).json({success: false, message: "Not Updated Genre"});
        return
      }
          

      res.status(200).json({
          success: true,
          message: `Genre name ${result.name} Updated!`,
          data: result
      })
    } catch (err) {
        next(err);
    }
};

const handleFindAllGenres: RequestHandler = async (req, res, next) => {
    try {
        const isExport: boolean = req.query.export === 'true';

        const genres: GenresResponse[] = await Genre.findAllGenres();

        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="genres-export.csv"');
            res.setHeader("Content-Type", "text/csv");
            
            const csvData: string = convertToCSV(genres);
            res.status(200).send(csvData);
            return 
        }

        res.status(200).json({
            success: true,
            message: `Found ${genres.length} Genre(s) successfully`,
            data: genres
        });
    } catch (err) {
        next(err);
    }
};

const handleFindGenreByName: RequestHandler = async (req, res, next) => {
    try {
        const name = req.query.name;
        const nameStr: string = name !== undefined && Array.isArray(name) ? String(name[0]) : String(name)

        const result: GenresResponse | null = await Genre.findGenreByName(nameStr);

        if(!result) {
          res.status(404).json({success: false, message: "Not Found Genre"});
          return
        }
            

        res.status(200).json({
            success: true,
            message: `Found Genre name ${name}`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

const handleFindGenreById: RequestHandler = async (req, res, next) => {
    try {
      const id: number | null = toNumber(strFromQueryOrParams(req.params.id));

      if (!id) throw new CustomError('Genre id Undefined! ', 400)

        const result: GenresResponse | null = await Genre.findGenreById(id);

        if(!result) {
          res.status(404).json({success: false, message: "Not Found Genre"});
          return
        }
            

        res.status(200).json({
            success: true,
            message: `Found Genre Id ${result.id}`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

const handleDeleteGenreById: RequestHandler = async (req, res, next) => {
    try {
      const id: number | null = toNumber(strFromQueryOrParams(req.params.id));

      if (!id) throw new CustomError('Genre id Undefined! ', 400)

      const result: number | null = await Genre.deleteGenreById(id);

      if(!result){
        res.status(404).json({success: false, message: "Not Found Genre"});
        return
      }

      res.status(200).json({
          success: true,
          message: `Genre Id ${id} Deleted!`,
          data: result
      })
    } catch (err) {
        next(err);
    }
};

export {
    handleCreateGenre,
    handleUpdateGenreById,
    handleFindAllGenres,
    handleFindGenreById,
    handleFindGenreByName,
    handleDeleteGenreById,
}