import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import cookieOptions from "#src/config/cookieOptions.js";
import { CustomError } from "#src/utils/customErr.js";
import User from "#src/service/userService.js";

import type { LoginUserType } from "#src/middleware/schemas/userSchema.js";
import type { FindUserByEmailResponse } from "#src/types/userType.js";

import type { RequestHandler } from "express";


const handleLogin: RequestHandler = async (req, res, next) => {
    try {
        if(!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) 
          throw new CustomError('ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is Undefined!', 500)

        const { email, password }: LoginUserType['body']  = req.body;

        const cleanEmail: string = email.trim().toLowerCase();

        const isExistUser: FindUserByEmailResponse | null = await User.findByEmail(cleanEmail);

        const matchPas: boolean = isExistUser ? await bcrypt.compare(password, isExistUser.password) : false;

        if (!isExistUser || !matchPas) {
          res.status(401).json({ success: false, message: "Invalid email or password" });
          return
        }

        // استخراج الـ IP والـ User-Agent من الـ Request
        const userAgent: string = req.headers["user-agent"] || "Unknown";
        const ipAddress: string | string[] = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
        const ipAddressStr: string | undefined = ipAddress && Array.isArray(ipAddress) ? ipAddress[0] : ipAddress

        // Create JWT accessToken
        const accessToken: string = jwt.sign(
            { userId: isExistUser.id, roles: isExistUser.roles },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" },
        );

        // Create JWT accessToken
        const refreshToken: string = jwt.sign(
          { userId: isExistUser.id, roles: isExistUser.roles },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" },
        );

        // save refreshToken in cookie
        res.cookie("jwt", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // حفظ الجلسة مع الـ IP والـ User-Agent في قاعدة البيانات
        await User.createSession(isExistUser.id, refreshToken, userAgent, ipAddressStr ?? "Unknown");

        // send accessToken to response for fron end (required: save accessToken in just memory)
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                userId : isExistUser.id,
                username : isExistUser.username,
                email : isExistUser.email,
                roles : isExistUser.roles,
                avatar_url : isExistUser.avatar_url,
                avatar_history: isExistUser.avatar_history,
                created_at: isExistUser.created_at,
                updated_at: isExistUser.updated_at,
            }
        });
    } catch (err) {
        next(err);
    }
};

export default handleLogin;