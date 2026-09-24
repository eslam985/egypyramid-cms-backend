// backend/src/controllers/auth/avatarController.js
const AvatarService = require('../../service/avatarService');
const cloudinary = require('../../config/cloudinary');
const streamifier = require('streamifier');

const handleUploadAvatar = async (req, res, next) => {
    try {
        const userId = req.user.id; // بناءً على verifyJWT

        // رفع الصورة إلى Cloudinary
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    { folder: 'profiles' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const uploadResult = await streamUpload(req);
        const imageUrl = uploadResult.secure_url;

        // تحديث قاعدة البيانات
        const result = await AvatarService.updateAvatarUrl(userId, imageUrl);

        return res.status(200).json({
            success: true,
            message: "تم تحديث الصورة بنجاح",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

const handleDeleteAvatar = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // مسح الرابط من قاعدة البيانات
        const result = await AvatarService.deleteAvatarUrl(userId);
        if (!result) {
            return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
        }

        // ملاحظة: هذا يحذف الرابط من الداتا بيز فقط. 
        // إذا أردت حذفه من Cloudinary ستحتاج لاستخراج public_id وحذفه عبر cloudinary.uploader.destroy

        return res.status(200).json({
            success: true,
            message: "تم مسح الصورة بنجاح",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { handleUploadAvatar, handleDeleteAvatar };