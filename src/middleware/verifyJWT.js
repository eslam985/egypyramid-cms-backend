// /backend/middleware/verifyJWT.js
const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
    // authorization
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) 
        return res.status(401).json({ success: false, message: "Unauthorized: Access token is missing" });

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) 
            return res.status(403).json({ success: false, message: "Forbidden: Invalid or expired access token" });
        
        // داخل verifyJWT.js
        req.userId = decoded.userId;

        // إذا كانت القيمة صالحة حولها لرقم، وإلا ضع 0 أو احذفها لحظر الريكويست بأمان
        req.roles = parseInt(decoded.roles) || null; 

        next();

    });
};

module.exports = verifyJWT;
