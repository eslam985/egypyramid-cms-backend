const pool = require("../config/dbConn.js");

const Season = {
    async createSeason(media_id, season_number) {
        const result = await pool.query(
            `INSERT INTO seasons (media_id, season_number) VALUES($1, $2) RETURNING *`,
            [media_id, season_number],
        );

        return result.rows[0] || null;
    },
    async updateSeasonById(id, season_number) {
        const result = await pool.query(
            `UPDATE seasons 
            SET season_number = $1 
            WHERE id = $2 
            RETURNING *`,
            [season_number, id],
        );

        return result.rows[0] || null;
    },
    async findSeasonsByMediaId(media_id) {
        const result = await pool.query(
            `SELECT 
                seasons.*,
                COUNT(episodes.id)::integer AS episodes_count
            FROM seasons
            LEFT JOIN episodes ON episodes.season_id = seasons.id
            WHERE seasons.media_id = $1
            GROUP BY seasons.id
            ORDER BY seasons.season_number ASC`,
            [media_id],
        );

        return result.rows;
    },
    async findSeasonById(id) {
        const result = await pool.query(
            `SELECT * FROM seasons WHERE id = $1 LIMIT 1`,
            [id],
        );

        return result.rows[0] || null;
    },

    async deleteSeasonById(id) {
        const result = await pool.query(
            `DELETE FROM seasons WHERE id = $1 RETURNING *`,
            [id],
        );

        return result.rows[0] || null;
    },
};

module.exports = Season;
