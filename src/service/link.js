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
    },
    async findAllLinks({ page = 1, limit = 20, sortBy = "created_at", sortOrder = "DESC" } = {}, isExport = false) {
        const queryParams = [];
        
        // إلغاء الـ LIMIT والـ OFFSET لو كان الطلب تصدير (Export)
        const border = isExport ? "" : `LIMIT $1`;
        const skip = isExport ? "" : `OFFSET $2`;

        if (!isExport) {
            const limitNum = Number(limit);
            const offset = (Number(page) - 1) * limitNum;
            queryParams.push(limitNum, offset);
        }

        const allowedColumns = {
            quality: "links.quality",
            server: "links.server",
            created_at: "links.created_at",
        };
        const orderByColumn = allowedColumns[sortBy] || "links.created_at";
        const orderDirection = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

        const linksResult = await pool.query(
            `SELECT * FROM links
            ORDER BY ${orderByColumn} ${orderDirection}
            ${border}
            ${skip}`,
            queryParams
        );

        return linksResult.rows;
    },

};

module.exports = Link;
