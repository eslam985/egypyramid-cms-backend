// backend/src/controllers/auth/avatarController.js
const AvatarService = require('../../service/avatarService');
const cloudinary = require('../../config/cloudinary');
const streamifier = require('streamifier');

// الرابط الثابت للصورة الافتراضية لحمايتها من الحذف السحابي
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dbahqgo8j/image/upload/blogger/iaeclevshfanh5j6x9ew.webp';

/**
 * دالة مساعدة لاستخراج الـ public_id من رابط Cloudinary
 * مثال: https://cloudinary.com -> profiles/nwyid14t2gmijcyuqz6p
 */
const getPublicIdFromUrl = (url) => {
    if (!url || url === DEFAULT_AVATAR) return null;
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        
        // إزالة رقم الإصدار (v1790486...) إن وجد، وامتداد الملف (.png)
        const pathWithVersion = parts[1].replace(/^v\d+\//, '');
        return pathWithVersion.substring(0, pathWithVersion.lastIndexOf('.'));
    } catch (e) {
        return null;
    }
};

// 1. رفع صورة جديدة وتغيير الصورة الحالية
const handleUploadAvatar = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "لم يتم استقبال أي ملف" });
        }

        // رفع الصورة كـ Stream إلى Cloudinary
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { 
                        folder: 'profiles', 
                        resource_type: 'image',
                        // 💡 الإعدادات الخارقة للأداء بدون التأثير على الجودة:
                        format: 'webp',         // إجبار تحويل الصورة لصيغة WebP الحديثة فائقة السرعة
                        quality: 'auto:good',   // ضغط الحجم بذكاء مع الحفاظ الصارم على الكواليتي (Good/High Quality)
                        transformation: [
                            { width: 800, height: 800, crop: 'limit' } // لو الصورة أضخم من 800 بكسل، يتم تصغيرها بمرونة لـ 800 لحماية الحجم دون قص الأطراف
                        ]
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };


        const uploadResult = await streamUpload(req.file.buffer);
        const imageUrl = uploadResult.secure_url;

        // تحديث قاعدة البيانات (الدالة الذكية المحدثة بالاستعلام الواحد)
        const result = await AvatarService.updateAvatarUrl(userId, imageUrl);

        return res.status(200).json({
            success: true,
            message: "تم تحديث الصورة الشخصية بنجاح!",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// 2. الحذف النهائي وتطهير السحابة
const handleDeleteAvatar = async (req, res, next) => {
    try {
        const userId = req.userId;

        // جلب رابط الصورة الحالية لمسحها من Cloudinary قبل تصفيرها في قاعدة البيانات
        const result = await AvatarService.deleteAvatarUrl(userId);
        if (!result) {
            return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
        }

        // استخراج الـ public_id وتطهير الملف القديم سحابياً
        // ملاحظة: نتيجة الدالة المحدثة تعيد البيانات القديمة قبل وضع الافتراضية
        const publicId = getPublicIdFromUrl(result.avatar_url);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        return res.status(200).json({
            success: true,
            message: "تم مسح الصورة الشخصية والعودة للوضع الافتراضي بنجاح",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// 3. دالة جديدة تماماً: اختيار صورة سابقة وتفعيلها
const handleSetAvatarFromHistory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { chosenAvatarUrl } = req.body;

        // استدعاء الخدمة الذرية للتبديل السريع في قاعدة البيانات
        const result = await AvatarService.setAvatarFromHistory(userId, chosenAvatarUrl);

        return res.status(200).json({
            success: true,
            message: "تم تبديل وتعيين الصورة الشخصية من السجل بنجاح",
            data: result,
        });
    } catch (err) {
        // إدارة الأخطاء القادمة من الـ Service في حال التلاعب بالروابط
        if (err.message.includes("غير موجودة في سجل الصور")) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next(err);
    }
};

module.exports = { 
    handleUploadAvatar, 
    handleDeleteAvatar,
    handleSetAvatarFromHistory // تصدير الدالة الجديدة للروتس
};
