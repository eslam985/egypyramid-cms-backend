const pool = require("../config/dbConn");
const Media = require("./media.js");

// slug: 8359-when-calls-the-heart-episode-10
const Episode = {
    async createEpisode(
        media_id,
        { season_id = null, episode_number = 1, ...extraData },
    ) {
        const foundMedia = await Media.findMediaById(media_id);
        if (!foundMedia) {
            const err = new Error("Media not found");
            err.statusCode = 404;
            throw err;
        }

        const cleanTitle = (
            foundMedia.normalized_title ||
            foundMedia.title ||
            ""
        )
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");

        const createSlug = `${foundMedia.id}-${cleanTitle}-episode-${episode_number}`;

        // تجميع كل البيانات مع الحقول الإضافية إن وجدت
        const episodeData = {
            media_id,
            episode_number,
            slug: createSlug,
            ...extraData,
        };

        const isSeries =
            season_id !== null &&
            (foundMedia.category === "tv" ||
                foundMedia.media_type === "series");
        if (isSeries) {
            episodeData.season_id = season_id;
        }

        const columns = Object.keys(episodeData).join(", ");
        const idx = Object.values(episodeData)
            .map((_, i) => `$${i + 1}`)
            .join(", ");
        const values = Object.values(episodeData);

        const result = await pool.query(
            `INSERT INTO episodes (${columns}) VALUES(${idx}) RETURNING *`,
            values,
        );

        return result.rows[0] || null;
    },
    async updateEpisodeById(id, data) {
        if (Object.keys(data).length === 0) {
            const err = new Error("No data provided");
            err.statusCode = 400;
            throw err;
        }

        const seter = Object.keys(data)
            .map((k, i) => `${k} = $${i + 1}`)
            .join(", ");
        const idxId = `$${Object.keys(data).length + 1}`;

        const result = await pool.query(
            ` UPDATE 
            episodes 
            SET
            ${seter}
            WHERE id = ${idxId}
            RETURNING *`,
            [...Object.values(data), id],
        );

        return result.rows[0] || null;
    },

    async findEpisodeById(id) {
        const result = await pool.query(
            `SELECT * FROM episodes WHERE id = $1`,
            [id],
        );

        return result.rows[0] || null;
    },

    async findEpisodesByMediaId(media_id, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT e.*, (SELECT COUNT(*)::int FROM links l WHERE l.episode_id = e.id) AS links_count
            FROM episodes e 
            WHERE e.media_id = $1 
            ORDER BY e.episode_number ASC 
            LIMIT $2 OFFSET $3`,
            [media_id, limit, offset],
        );

        return result.rows;
    },

    async findEpisodesBySeasonId(season_id) {
        const result = await pool.query(
            `SELECT e.*, (SELECT COUNT(*)::int FROM links l WHERE l.episode_id = e.id) AS links_count
        FROM episodes e 
        WHERE e.season_id = $1
        ORDER BY e.episode_number ASC`,
            [season_id],
        );

        return result.rows;
    },

    async deleteEpisodeById(id) {
        const result = await pool.query(
            `DELETE FROM episodes WHERE id = $1 RETURNING *`,
            [id],
        );

        return result.rows[0] || null;
    },
};

module.exports = Episode;
