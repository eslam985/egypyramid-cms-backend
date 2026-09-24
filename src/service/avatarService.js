// backend/src/service/avatarService.js
const pool = require('../config/dbConn');

const AvatarService = {
    async updateAvatarUrl(userId, avatarUrl) {
        const result = await pool.query(
            `UPDATE users SET avatar_url = $1, updated_at = now() WHERE id = $2 RETURNING id, username, avatar_url`,
            [avatarUrl, userId]
        );
        return result.rows[0] || null;
    },

    async deleteAvatarUrl(userId) {
        const result = await pool.query(
            `UPDATE users SET avatar_url = NULL, updated_at = now() WHERE id = $1 RETURNING id, username, avatar_url`,
            [userId]
        );
        return result.rows[0] || null;
    }
};

module.exports = AvatarService;