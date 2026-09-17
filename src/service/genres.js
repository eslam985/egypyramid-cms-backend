const pool = require("../config/dbConn.js");
const { slugify } = require("../utils/regex")

const Genres = {
    async createGenre(data = {}) {
        if (!data || Array.isArray(data) || typeof data !== 'object' || Object.keys(data).length === 0) {
            const err = new Error("No Data Provided!");
            err.statusCode = 400;
            throw err;
        }

        let slugGener = slugify(data.name)
        data.slug = slugGener

        const columns = Object.keys(data).join(", ");
        const idx = Object.keys(data).map((_, i) => `$${i + 1}`).join(", ");
        const values = Object.values(data);

        const result = await pool.query(
            `INSERT INTO genres (${columns}) VALUES (${idx}) RETURNING *`,
            values
        );

        return result.rows[0] || null;
    },


    async updateGenreById(id, data = {}) {
        if (!id || !Number.isInteger(id) || id <= 0) {
            const err = new Error("Id Not Valid or Not Provided!");
            err.statusCode = 400;
            throw err;
        }
        
        if (!data || Array.isArray(data) || typeof data !== 'object' || Object.keys(data).length === 0) {
            const err = new Error("No Data Provided!");
            err.statusCode = 400;
            throw err;
        }

        if (data.name) {
            data.slug = slugify(data.name);
        }

        const seter = Object.keys(data).map((c, i) => `${c} = $${i + 1}`).join(", ");
        const idx = `$${Object.keys(data).length + 1}`;
        const values = [...Object.values(data), id];

        const result = await pool.query(
            `UPDATE genres SET ${seter} WHERE id = ${idx} RETURNING *`,
            values
        );

        return result.rows[0] || null;
    },

    async findAllGenres() {
        const result = await pool.query(
            `SELECT * FROM genres ORDER BY name ASC`
        );

        return result.rows;
    },

    async findGenreById(id) {
        if (!id || !Number.isInteger(id) || id <= 0) {
            const err = new Error("Id Not Valid or Not Provided!");
            err.statusCode = 400;
            throw err;
        }

        const result = await pool.query(
            `SELECT * FROM genres WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    },

    async findGenreByName(name) {
        const result = await pool.query(
            `SELECT * FROM genres WHERE name ILIKE $1`,
            [name]
        );

        return result.rows[0] || null;
    },
    
    async deleteGenreById(id) {
        if (!id || !Number.isInteger(id) || id <= 0) {
            const err = new Error("Id Not Valid or Not Provided!");
            err.statusCode = 400;
            throw err;
        }

        const result = await pool.query(
            `DELETE FROM genres WHERE id = $1 RETURNING *`,
            [id]
        );

        return result.rows[0] || null;
    },
};

module.exports = Genres;