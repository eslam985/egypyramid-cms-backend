const Link = require("../../service/link");
const { convertToCSV } = require("../../utils/csv");

// createLink(episode_id, data = {})
const handleCreateLink = async (req, res, next) => {
	try {
		const episode_id = req.params.episode_id;
		const data = req.body
		const result = await Link.createLink(episode_id, data);

		return res.status(201).json({
			success: true,
			message: `link Id ${result.id} Created!`,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};

//  updateLinkById(id, data = {})
const handleUpdateLinkById = async (req, res, next) => {
	try {
		const id = req.params.id;
		const data = req.body;
		const result = await Link.updateLinkById(id, data);

		if(!result) 
			return res.status(404).json({ success: false,message: "Link Not Found Or Not Updated!",})

		return res.status(200).json({
			success: true,
			message: `link Id ${id} Updated!`,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};
// findLinksByEpisodeId(episode_id){
const handleFindLinkByEpisodeId = async (req, res, next) => {
    try {
        const episode_id = req.params.episode_id;
        const result = await Link.findLinksByEpisodeId(episode_id);

        if (!result) 
            return res.status(404).json({ success: false, message: "No Links Found!" });

        return res.status(200).json({
            success: true,
            message: `Found ${result.length} Link(s)!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};
// deleteLinkById(id){
const handleDeleteLinkById = async (req, res, next) => {
	try {
		const id = req.params.id;
		const result = await Link.deleteLinkById(id);

		if(!result) 
			return res.status(404).json({ success: false,message: "Link Not Found!",})

		return res.status(200).json({
			success: true,
			message: `link Id ${id} Deleted!`,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};
const handleFindLinkById = async (req, res, next) => {
	try {
		const id = req.params.id;
		const result = await Link.findLinkById(id);

		if(!result) 
			return res.status(404).json({ success: false,message: "Link Not Found!",})

		return res.status(200).json({
			success: true,
			message: `link Id ${id} Found!`,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};

const handleFindAllLinks = async (req, res, next) => {
    try {
        const isExport = req.query.export === 'true';
        const links = await Link.findAllLinks(req.query, isExport);
        
        if (isExport) {
            res.setHeader("Content-Disposition", 'attachment; filename="links-export.csv"');
            res.setHeader("Content-Type", "text/csv");
            
            const csvData = convertToCSV(links); 
            return res.status(200).send(csvData);
        }

        return res.status(200).json({
            success: true,
            message: `Found ${links.length} Link(s)`,
            data: links
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
	handleCreateLink,
	handleUpdateLinkById,
	handleFindLinkByEpisodeId,
	handleDeleteLinkById,
  handleFindLinkById,
  handleFindAllLinks
}