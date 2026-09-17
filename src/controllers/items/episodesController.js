const Episode = require("../../service/episode.js");

// createEpisode({ media_id, season_id = null, episode_number = 1 })
// handleCreateEpisode
const handleCreateEpisode = async (req, res, next) => {
    try {
        const media_id = req.params.media_id;

        const { season_id, episode_number, ...restBody } = req.body;

        const result = await Episode.createEpisode(media_id, {
            season_id: season_id ?? null,
            episode_number,
            ...restBody,
        });

        return res.status(201).json({
            success: true,
            message: `Episode Number ${episode_number} Created!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};


// updateEpisodeById(id, data)
const handleUpdateEpisodeById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const result = await Episode.updateEpisodeById(id, data);

        if (!result)
            return res
                .status(404)
                .json({ success: false, message: "Episode not found" });

        return res.status(200).json({
            success: true,
            message: `Episode ID ${id} Updated!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// findEpisodesBySeasonId(season_id)
const handleFindEpisodesBySeasonId = async (req, res, next) => {
    try {
        const season_id = req.params.season_id;
        const result = await Episode.findEpisodesBySeasonId(season_id);

        if (!result)
            return res
                .status(404)
                .json({ success: false, message: "Episode not found" });

        return res.status(200).json({
            success: true,
            message: `Found ${result.length} Episode(s)!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// findEpisodesByMediaId(media_id)
const handleFindEpisodesByMediaId = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const media_id = req.params.media_id;
        const result = await Episode.findEpisodesByMediaId(
            media_id,
            page,
            limit,
        );

        return res.status(200).json({
            success: true,
            message: `Found ${result.length} Episode(s)!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

//  findEpisodeById(id)
const handleFindEpisodeById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await Episode.findEpisodeById(id);

        if (!result)
            return res
                .status(404)
                .json({ success: false, message: `Not Found Episode Id ${id}` });

        return res.status(200).json({
            success: true,
            message: `Found Episode Id ${id}`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

//   async deleteEpisodeById(id)
const handleDeleteEpisodeById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await Episode.deleteEpisodeById(id);

        if (!result)
            return res
                .status(404)
                .json({ success: false, message: "Episode not found" });

        return res.status(200).json({
            success: true,
            message: `Episode Id ${id} Deleted!`,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleCreateEpisode,
    handleUpdateEpisodeById,
    handleFindEpisodesBySeasonId,
    handleFindEpisodesByMediaId,
    handleFindEpisodeById,
    handleDeleteEpisodeById,
};
