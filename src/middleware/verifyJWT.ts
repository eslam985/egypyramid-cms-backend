import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { DecodedToken } from '#src/types/userType.js'
import User from '#src/service/userService.js'; // 💡 استيراد الـ User service للتحقق من الجلسات

const verifyJWT: RequestHandler = async (req, res, next) => {
  try {
    const authHeader: string | string[] | undefined = req.headers.authorization || req.headers.Authorization;
    const authHeaderStr: string | undefined = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    if (!authHeaderStr || !authHeaderStr.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Unauthorized: Access token is missing" });
      return;
    }

    const token: string | undefined = authHeaderStr.split(" ")[1];
    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized: Access token is missing" });
      return;
    }

    const secret: string | undefined = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      res.status(500).json({ success: false, message: "Server error: Secret is missing" });
      return;
    }

    // 1. التحقق من صحة التوكن رياضياً
    const decoded = jwt.verify(token, secret) as DecodedToken;
    if (!decoded || !decoded.userId) {
      res.status(401).json({ success: false, message: "Forbidden: Invalid access token" });
      return;
    }

    // 💡 2. التحقق من قاعدة البيانات: هل المستخدم يمتلك جلسات نشطة أصلاً؟
    // (يجب أن يكون لديك دالة في الـ User service تتحقق من وجود جلسات لهذا الـ userId)
    // 💡 التحقق الصحيح باستخدام userId في جدول الجلسات
    const hasActiveSessions = await User.hasActiveSessions(decoded.userId);
    
    if (!hasActiveSessions) {
      res.status(401).json({ 
        success: false, 
        message: "Unauthorized: All sessions have been terminated. Please log in again." 
      });
      return;
    }

    req.userId = decoded.userId;
    req.roles = parseInt(decoded.roles, 10) || null;

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Forbidden: Invalid or expired access token" });
    return;
  }
};

export default verifyJWT;