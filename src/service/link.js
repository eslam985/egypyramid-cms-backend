const pool = require("../config/dbConn.js");

const Link = {
    async createLink(episode_id, data = {}) {
        if (Object.keys(data).length === 0) {
            const err = new Error("NO Data provided!");
            err.statusCode = 400;
            throw err
        }

        // دمج episode_id مع بقية البيانات في أوبجكت واحد
        const linkData = { episode_id, ...data };

        const columns = Object.keys(linkData).join(", ");
        const idx = Object.keys(linkData).map((_, i) => `$${i + 1}`).join(", ");
        const values = Object.values(linkData);

        const result = await pool.query(
            `INSERT INTO links (${columns}) VALUES (${idx}) RETURNING *`,
            values
        );

        return result.rows[0] || null;
    },

    async updateLinkById(id, data = {}) {
        // حماية: إذا لم تكن هناك بيانات للتعديل ارجع null فوراً
        if (Object.keys(data).length === 0) {
            const err = new Error("NO Data provided!");
            err.statusCode = 400;
            throw err
        }

        const seter = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(", ");
        const idxId = `$${Object.keys(data).length + 1}`;

        const result = await pool.query(
            `UPDATE links SET ${seter} WHERE id = ${idxId} RETURNING *`,
            [...Object.values(data), id]
        );
        
        return result.rows[0] || null;
    },
    async findLinksByEpisodeId(episode_id){
        const result = await pool.query(
            `SELECT * FROM links WHERE episode_id = $1`,
            [episode_id]
        )
        
        return result.rows
    },
    async findLinkById(id){
        const result = await pool.query(
            `SELECT * FROM links WHERE id = $1`,
            [id]
        )
        
        return result.rows[0] || null
    },
    async deleteLinkById(id){
        const result = await pool.query(
            `DELETE FROM links WHERE id = $1 RETURNING *`,
            [id]
        )

        return result.rows[0] || null
    }
};

module.exports = Link;
