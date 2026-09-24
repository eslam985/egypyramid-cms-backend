// /backend/controllers/auth/logoutController.js
const User = require("../../service/userService.js");

const handleLogout = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204);

        const refreshToken = cookies.jwt;
        
        // التحقق من وجود المستخدم والجلسة بناءً على التوكن
        const isExistUser = await User.findByRefreshToken(refreshToken);

        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            sameSite: isProduction ? "None" : "Lax",
            secure: isProduction,
        };

        // لو التوكن غير موجود في الداتا بيز امسح الكوكي وخلاص
        if (!isExistUser) {
            res.clearCookie("jwt", cookieOptions);
            return res.sendStatus(204);
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

module.exports = handleLogout;