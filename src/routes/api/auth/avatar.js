// backend/src/routes/api/auth/avatar.js
const express = require("express");
const router = express.Router();

const { handleUploadAvatar, handleDeleteAvatar } = require("../../../controllers/auth/avatarController.js");
const upload = require("../../../middleware/uploadMiddleware.js");
const verifyJWT = require("../../../middleware/verifyJWT.js");
const { uploadAvatarSchema } = require("../../../middleware/schemas/avatarSchema.js");

// ميدل وير مخصص لفحص الملف عبر Zod
const validateFile = (schema) => (req, res, next) => {
    try {
        schema.parse({ file: req.file });
        next();
    } catch (err) {
        return res.status(400).json({ success: false, errors: err.errors });
    }
};

// الروتس
router.post("/", verifyJWT, upload.single('profileImage'), validateFile(uploadAvatarSchema), handleUploadAvatar);
router.delete("/", verifyJWT, handleDeleteAvatar);

module.exports = router;