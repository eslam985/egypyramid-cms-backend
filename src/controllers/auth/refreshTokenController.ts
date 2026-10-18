///backend/controllers/auth/refreshTokenController.js
import jwt from "jsonwebtoken";

import type { RequestHandler } from "express";

import cookieOptions from "#src/config/cookieOptions.js";
import { CustomError } from "#src/utils/customErr.js";
import User from "#src/service/userService.js";

import { FindByRefreshTokenResponse, DecodedToken } from '#src/types/userType.js';

const handleRefreshToken: RequestHandler = async (req, res, next) => {
    try {
        if(!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) 
          throw new CustomError('ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is Undefined!', 500)

        const refreshToken: string = req.cookies.jwt;

        if (!refreshToken) {
          res.sendStatus(401);

          return 
        }

        // البحث عن المستخدم بـ Refresh Token
        const foundUser: FindByRefreshTokenResponse | null = await User.findByRefreshToken(refreshToken);

        // إذا كان التوكن غير موجود في الداتا بيز امسح الكوكي
        if (!foundUser) {
            res.clearCookie("jwt", cookieOptions);
            res.sendStatus(403);

            return 
        }

        // التحقق من صحة التوكن (سيرمي استثناء تلقائياً لو التوكن منتهي أو غير صالح)
        let decoded: DecodedToken;

        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET,
            ) as DecodedToken;
        } catch (err) {
            res.clearCookie("jwt", cookieOptions);
            res.sendStatus(403);

            return 
        }

        if (foundUser.id !== decoded.userId) {
            res.clearCookie("jwt", cookieOptions);
            res.sendStatus(403);

            return 
        }

        // <<--- تمديد وتحديث الجلسة في قاعدة البيانات هنا --->>
        await User.refreshSession(refreshToken);

        // إنشاء Access Token جديد
        const accessToken: string = jwt.sign(
            { userId: foundUser.id, roles: foundUser.roles },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" },
        );

        res.status(200).json({
            success: true,
            message: "Access token updated successfully",
            data: accessToken,
        });
    } catch (err) {
        next(err);
    }
};

export default handleRefreshToken;
