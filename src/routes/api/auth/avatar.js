// backend/src/routes/api/auth/avatar.js
const express = require("express");
const router = express.Router();

const upload = require("../../../middleware/uploadMiddleware.js");
const { validateFile, validateRequest } = require("../../../middleware/validation.js"); // 💡 استوردنا validateRequest للفحص العادي

const {
  uploadAvatarSchema,
  setAvatarFromHistorySchema // 💡 استيراد المخطط الجديد لفحص روابط السجل
} = require("../../../middleware/schemas/avatarSchema.js");

const {
  handleUploadAvatar,
  handleDeleteAvatar,
  handleSetAvatarFromHistory // 💡 استيراد الدالة الجديدة من الـ Controller
} = require("../../../controllers/auth/avatarController.js");

// 1. رفع صورة جديدة ونقل الحالية للسجل
router.post("/", upload.single('profileImage'), validateFile(uploadAvatarSchema), handleUploadAvatar);

// 2. الحذف النهائي وتصفير الصورة الحالية
router.delete("/", handleDeleteAvatar);

// 3. مسار جديد: اختيار وتبديل الصورة من السجل القديم
router.patch("/set-previous", validateRequest(setAvatarFromHistorySchema), handleSetAvatarFromHistory);

module.exports = router;
