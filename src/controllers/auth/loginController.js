const bcrypt = require("bcrypt");
const User = require("../../service/userService.js");
const jwt = require("jsonwebtoken");
const cookieOptions = require("../../config/cookieOptions.js");

const handleLogin = async (req, res, next) => {
    try {

        const { email, password } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const isExistUser = await User.findByEmail(cleanEmail);

        const matchPas = isExistUser ? await bcrypt.compare(password, isExistUser.password) : false;

        if (!isExistUser || !matchPas) 
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        console.log(isExistUser)
        // استخراج الـ IP والـ User-Agent من الـ Request
        const userAgent = req.headers["user-agent"] || "Unknown";
        const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";

        // Create JWT accessToken
        const accessToken = jwt.sign(
            { userId: isExistUser.id, roles: isExistUser.roles },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" },
        );

        // Create JWT accessToken
        const refreshToken = jwt.sign(
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
        await User.createSession(isExistUser.id, refreshToken, userAgent, ipAddress);

        // send accessToken to response for fron end (required: save accessToken in just memory)
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken,
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = handleLogin;
