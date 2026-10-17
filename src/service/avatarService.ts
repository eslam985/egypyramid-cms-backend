// backend/src/service/avatarService.js
import { SetAndUpdateAvatarUrlResponse } from "#src/types/userType.js";
import { CustomError } from "#src/utils/customErr.js";
import pool from "#src/config/dbConn.js";


// الرابط الثابت للصورة الافتراضية
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dbahqgo8j/image/upload/blogger/iaeclevshfanh5j6x9ew.webp';


const AvatarService = {
    // 1. رفع صورة جديدة ونقل الحالية للتاريخ (في استعلام واحد محمي بالكامل)
    async updateAvatarUrl(userId: string, newAvatarUrl: string): Promise<SetAndUpdateAvatarUrlResponse | null> {
        const result = await pool.query(
          `update users
            set
              avatar_history = case
                when avatar_url is not null
                and avatar_url != $1
                and not (avatar_url = any (avatar_history)) then array_append(avatar_history, avatar_url)
                else avatar_history
              end,
              avatar_url = $2,
              updated_at = now()
            where
              id = $3
            returning
              id,
              username,
              avatar_url,
              avatar_history`,
          [DEFAULT_AVATAR, newAvatarUrl, userId]
        );
        
        return result.rows[0] || null;
    },
    // 2. حذف الصورة الحالية والعودة للافتراضية (استعلام واحد سليم)
    async deleteAvatarUrl(userId: string): Promise<number | null> {
        const result = await pool.query(
          `UPDATE users 
          SET 
            avatar_url = $1, 
            updated_at = now() 
          WHERE id = $2`,
          [DEFAULT_AVATAR, userId]
        );

        return result.rowCount;
    },
    // 3. التبديل من التاريخ (استعلام واحد يحذف من التاريخ ويدفع الحالية إليه معاً)
    async setAvatarFromHistory(userId: string, chosenAvatarUrl: string): Promise<SetAndUpdateAvatarUrlResponse | null> {
        const result = await pool.query(
          `update users
            set
              avatar_history = case
                when avatar_url is not null
                and avatar_url != $1
                and not (avatar_url = any (avatar_history)) then array_append(array_remove(avatar_history, $2), avatar_url)
                else array_remove(avatar_history, $2)
              end,
              avatar_url = $2,
              updated_at = now()
            where
              id = $3
              and $2 = any (avatar_history)
            returning
              id,
              username,
              avatar_url,
              avatar_history`,
            [DEFAULT_AVATAR, chosenAvatarUrl, userId]
        );

        if (result.rows.length === 0) 
          throw new CustomError("الصورة المختارة غير موجودة في سجل الصور الخاص بك أو حدث خطأ أثناء التحديث", 404)  

        return result.rows[0] || null;
    }
};

export default AvatarService;
