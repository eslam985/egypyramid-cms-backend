import convertToCSV from "#src/utils/csv.js";
import Link from "#src/service/link.js";

import type { RequestHandler } from "express";

import { CreateLinkType, UpdateLinkByIdType, BaseLinkQueryType } from '#src/middleware/schemas/linkSchema.js'
import { LinksResponse } from '#src/types/linkType.js'

import { strFromQueryOrParams, toNumber } from "#src/utils/paramAndQueryHelpes.js";
import { CustomError } from "#src/utils/customErr.js";



const handleCreateLink: RequestHandler = async (req, res, next) => {
	try {
    const episode_id = toNumber(strFromQueryOrParams(req.params.episode_id));
    
    if(!episode_id) throw new CustomError('episode id Undefined! ', 400)

		const data: CreateLinkType = req.body

		const result: LinksResponse | null = await Link.createLink(episode_id, data);

    if(!result) {
      res.status(404).json({success: false, message: 'Episode Id Not Found!'})
      return
    }

		res.status(201).json({
			success: true,
			message: `link Id ${result.id} Created!`,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};

const handleUpdateLinkById: RequestHandler = async (req, res, next) => {
	try {
    const id: number | null =toNumber(strFromQueryOrParams(req.params.id));
    
    if (!id) throw new CustomError('Link id Undefined! ', 400)

		const data: UpdateLinkByIdType = req.body;

		const result = await Link.updateLinkById(id, data);

		if(!result) {
      res.status(404).json({ success: false,message: "Link Not Found Or Not Updated!",})
      return
    }

		res.status(200).json({
			success: true,
			message: `link Id ${id} Updated!`,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};
// findLinksByEpisodeId(episode_id){
const handleFindLinkByEpisodeId: RequestHandler = async (req, res, next) => {
    try {
      const idepisode_id = toNumber(strFromQueryOrParams(req.params.episode_id));
      
      if (!idepisode_id) throw new CustomError('episode id Undefined! ', 400)

      const result: LinksResponse[] = await Link.findLinksByEpisodeId(idepisode_id);

      res.status(200).json({
          success: true,
          message: `Found ${result.length} Link(s)!`,
          data: result,
      });
    } catch (err) {
        next(err);
    }
};
// deleteLinkById(id){
const handleDeleteLinkById: RequestHandler = async (req, res, next) => {
	try {
    const id: number | null =toNumber(strFromQueryOrParams(req.params.id));

    if (!id) throw new CustomError('Link id Undefined! ', 400)

		const result: number | null = await Link.deleteLinkById(id);

		if(!result) {
      res.status(404).json({ success: false,message: "Link Not Found!",})
      return
    }

		res.status(200).json({
			success: true,
			message: `link Id ${id} Deleted!`,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};
const handleFindLinkById: RequestHandler = async (req, res, next) => {
	try {
    const id: number | null = toNumber(strFromQueryOrParams(req.params.id));

    if (!id) throw new CustomError('Link id Undefined! ', 400)

		const result: LinksResponse | null = await Link.findLinkById(id);

		if(!result) {
      res.status(404).json({ success: false,message: "Link Not Found!",})
      return
    }

		res.status(200).json({
			success: true,
			message: `link Id ${id} Found!`,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};

const handleFindAllLinks: RequestHandler = async (req, res, next) => {
    try {
        const isExport = req.query.export === 'true';
        const query = req.query as unknown as BaseLinkQueryType

        const links = await Link.findAllLinks(query, isExport);
        
        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="links-export.csv"');
            res.setHeader("Content-Type", "text/csv");
            
            const csvData: string = convertToCSV(links); 
            res.status(200).send(csvData);
            return
        }

        res.status(200).json({
            success: true,
            message: `Found ${links.length} Link(s)`,
            data: links
        });
    } catch (err) {
        next(err);
    }
};

export {
	handleCreateLink,
	handleUpdateLinkById,
	handleFindLinkByEpisodeId,
	handleDeleteLinkById,
  handleFindLinkById,
  handleFindAllLinks
}