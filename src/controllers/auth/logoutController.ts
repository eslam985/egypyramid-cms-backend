// /backend/controllers/auth/logoutController.js
import type { RequestHandler } from "express";

import cookieOptions from "#src/config/cookieOptions.js";
import User from "#src/service/userService.js";

import { FindByRefreshTokenResponse } from '#src/types/userType.js'

const handleLogout: RequestHandler = async (req, res, next) => {
    try {
        const refreshToken: string | undefined = req.cookies.jwt;

        if (!refreshToken){
          res.sendStatus(204);
          return 
        }

        
        // التحقق من وجود المستخدم والجلسة بناءً على التوكن
        const isExistUser: FindByRefreshTokenResponse | null = await User.findByRefreshToken(refreshToken);

        // لو التوكن غير موجود في الداتا بيز امسح الكوكي وخلاص
        if (!isExistUser) {
            res.clearCookie("jwt", cookieOptions);
            res.sendStatus(204);
            return 
        }

        // حذف جلسة هذا الجهاز فقط من جدول sessions
        await User.removeSessionRefreshToken(refreshToken);

        // مسح الكوكي من المتصفح
        res.clearCookie("jwt", cookieOptions);

        res.status(200).json({ 
            success: true,
            message: "Logout successful" 
        });
    } catch (err) {
        next(err);
    }
};

export default handleLogout;