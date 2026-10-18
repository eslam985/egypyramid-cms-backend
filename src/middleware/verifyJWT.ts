// /backend/middleware/verifyJWT.ts
import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";

import { DecodedToken } from '#src/types/userType.js'

const verifyJWT: RequestHandler = (req, res, next) => {
  // authorization
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

  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded || typeof decoded === "string") {
      res.status(401).json({ success: false, message: "Forbidden: Invalid or expired access token" });
      return;
    }

    const payload: DecodedToken = decoded as DecodedToken;

    // داخل verifyJWT
    req.userId = payload.userId;

    // إذا كانت القيمة صالحة حولها لرقم، وإلا ضع null لحظر الريكويست بأمان
    req.roles = parseInt(payload.roles, 10) || null;

    next();
  });
};

export default verifyJWT;

