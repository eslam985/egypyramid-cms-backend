///backend/controllers/auth/refreshTokenController.js
const User = require("../../service/userService.js");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["x-refresh-token"];
        if (!authHeader) return res.sendStatus(401);
        const refreshToken = authHeader;

        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            sameSite: isProduction ? "None" : "Lax",
            secure: isProduction,
        };

        // البحث عن المستخدم بـ Refresh Token
        const foundUser = await User.findByRefreshToken(refreshToken);
        // إذا كان التوكن غير موجود في الداتا بيز امسح الكوكي
        if (!foundUser) {
            res.clearCookie("jwt", cookieOptions);
            return res.sendStatus(403);
        }

        // التحقق من صحة التوكن (سيرمي استثناء تلقائياً لو التوكن منتهي أو غير صالح)
        let decoded;
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET,
            );
        } catch (err) {
            res.clearCookie("jwt", cookieOptions);
            return res.sendStatus(403);
        }

        if (foundUser.id !== decoded.userId) {
            res.clearCookie("jwt", cookieOptions);
            return res.sendStatus(403);
        }

        // <<--- تمديد وتحديث الجلسة في قاعدة البيانات هنا --->>
        await User.refreshSession(refreshToken);

        // إنشاء Access Token جديد
        const accessToken = jwt.sign(
            { userId: foundUser.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" },
        );

        return res.status(200).json({
            success: true,
            message: "Access token updated successfully",
            data: accessToken,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = handleRefreshToken;
