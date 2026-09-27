// backend/src/service/avatarService.js
const pool = require('../config/dbConn');

// الرابط الثابت للصورة الافتراضية
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dbahqgo8j/image/upload/blogger/iaeclevshfanh5j6x9ew.webp';
const AvatarService = {
    // 1. رفع صورة جديدة ونقل الحالية للتاريخ (في استعلام واحد محمي بالكامل)
    async updateAvatarUrl(userId, newAvatarUrl) {
        const result = await pool.query(
            `UPDATE users 
             SET 
                avatar_history = CASE 
                    WHEN avatar_url IS NOT NULL 
                         AND avatar_url != $1 
                         AND NOT (avatar_url = ANY(avatar_history)) 
                    THEN array_append(avatar_history, avatar_url)
                    ELSE avatar_history
                END,
                avatar_url = $2,
                updated_at = now() 
             WHERE id = $3 
             RETURNING id, username, avatar_url, avatar_history`,
            [DEFAULT_AVATAR, newAvatarUrl, userId]
        );
        
        return result.rows[0] || null;
    },

    // 2. حذف الصورة الحالية والعودة للافتراضية (استعلام واحد سليم)
    async deleteAvatarUrl(userId) {
        const result = await pool.query(
            `UPDATE users 
             SET avatar_url = $1, updated_at = now() 
             WHERE id = $2 
             RETURNING id, username, avatar_url, avatar_history`,
            [DEFAULT_AVATAR, userId]
        );
        return result.rows[0] || null;
    },

    // 3. التبديل من التاريخ (استعلام واحد يحذف من التاريخ ويدفع الحالية إليه معاً)
    async setAvatarFromHistory(userId, chosenAvatarUrl) {
        const result = await pool.query(
            `UPDATE users 
             SET 
                avatar_history = CASE 
                    WHEN avatar_url IS NOT NULL 
                         AND avatar_url != $1 
                         AND NOT (avatar_url = ANY(avatar_history)) 
                    THEN array_append(array_remove(avatar_history, $2), avatar_url)
                    ELSE array_remove(avatar_history, $2)
                END,
                avatar_url = $2,
                updated_at = now() 
             WHERE id = $3 AND $2 = ANY(avatar_history)
             RETURNING id, username, avatar_url, avatar_history`,
            [DEFAULT_AVATAR, chosenAvatarUrl, userId]
        );

        if (result.rows.length === 0) {
            throw new Error("الصورة المختارة غير موجودة في سجل الصور الخاص بك أو حدث خطأ أثناء التحديث");
        }

        return result.rows[0] || null;
    }
};

module.exports = AvatarService;
