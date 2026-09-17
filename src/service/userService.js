const pool = require("../config/dbConn.js");

const User = {
    async create({ username, email, password }) {
        const result = await pool.query(
            `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *`,
            [username, email, password],
        );
        const newUser = result.rows[0];
        return {
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        };
    },

    async updateUserById(userId, data) {
        const keys = Object.keys(data);
        if (keys.length === 0) return null;

        const seter = keys.map((c, i) => `${c} = $${i + 2}`).join(", ");
        const values = Object.values(data);

        const result = await pool.query(
            `UPDATE users SET ${seter}, updated_at = NOW() WHERE id = $1 RETURNING id, username, email`,
            [userId, ...values],
        );

        return result.rows[0] || null;
    },

    async findUserById(userId) {
        const result = await pool.query(
            `SELECT id, username, email, password FROM users WHERE id = $1`,
            [userId],
        );
        return result.rows[0] || null;
    },

    async findByEmail(email) {
        const result = await pool.query(
            `SELECT id, username, email, password FROM users WHERE email = $1`,
            [email],
        );
        return result.rows[0] || null;
    },

    async findByUsername(username) {
        const result = await pool.query(
            `SELECT id, username, email, password FROM users WHERE username = $1`,
            [username],
        );
        return result.rows[0] || null;
    },

    // مثال داخل userService.js
    async createSession(userId, refreshToken, userAgent, ipAddress) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const result = await pool.query(
            `INSERT INTO sessions (user_id, refresh_token, user_agent, ip_address, expires_at) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, refreshToken, userAgent, ipAddress, expiresAt],
        );
        return result.rows[0];
    },
    // البحث عن المستخدم من خلال الـ Refresh Token بالربط مع جدول sessions
    async findByRefreshToken(token) {
        const result = await pool.query(
            `SELECT u.id, u.username, u.email, u.password, s.refresh_token as refreshtoken 
             FROM sessions s
             JOIN users u ON s.user_id = u.id
             WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
            [token],
        );
        return result.rows[0] || null;
    },

    // تحديث وقت الجلسة وتمديد صلاحيتها عند الـ Refresh الناجح
    async refreshSession(token) {
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // تمديد 7 أيام جديدة (أو حسب رغبتك)
        const result = await pool.query(
            `UPDATE sessions 
             SET expires_at = $1, updated_at = NOW() 
             WHERE refresh_token = $2`,
            [newExpiresAt, token],
        );
        return result.rowCount > 0;
    },

    // دالة إضافية لحذف الجلسة عند تسجيل الخروج (Logout)
    async removeSession(token) {
        const result = await pool.query(
            `DELETE FROM sessions WHERE refresh_token = $1`,
            [token],
        );
        return result.rowCount > 0;
    },
};

module.exports = User;
