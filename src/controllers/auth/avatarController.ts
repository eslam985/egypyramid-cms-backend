// backend/src/controllers/auth/avatarController.js
// @ts-expect-error streamifier does not provide TypeScript declarations.
import streamifier from "streamifier";

import type { RequestHandler } from "express";

import AvatarService from "#src/service/avatarService.js";
import { CustomError } from "#src/utils/customErr.js";
import cloudinary from "#src/config/cloudinary.js";

import { DeleteAvatarUrlResponse, SetAndUpdateAvatarUrlResponse } from "#src/types/userType.js";
import type { SetAvatarFromHistoryType } from "#src/middleware/schemas/avatarSchema.js";
import { DecodedToken } from '#src/types/userType.js';


// الرابط الثابت للصورة الافتراضية لحمايتها من الحذف السحابي
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dbahqgo8j/image/upload/blogger/iaeclevshfanh5j6x9ew.webp';

interface CloudinaryTransform {
    width: number;
    height: number;
    crop: 'limit';
}

interface CloudinaryUploadOptions {
    folder: string;
    resource_type: 'image';
    format: 'webp';
    quality: string;
    transformation: CloudinaryTransform[];
}

interface CloudinaryUploadResult {
    secure_url: string;
}

/**
 * دالة مساعدة لاستخراج الـ public_id من رابط Cloudinary
 * مثال: https://cloudinary.com -> profiles/nwyid14t2gmijcyuqz6p
 */
const getPublicIdFromUrl = (url: string): string | null => {

    if (!url || url === DEFAULT_AVATAR) return null;

    try {
        const parts: string[] = url.split('/upload/');

        if (!parts || parts.length < 2) return null;
        
        // إزالة رقم الإصدار (v1790486...) إن وجد، وامتداد الملف (.png)
        const pathWithVersion: string | null = parts[1] ? parts[1].replace(/^v\d+\//, '') : null;

        if(!pathWithVersion) return null

        return pathWithVersion.substring(0, pathWithVersion.lastIndexOf('.'));
    } catch (e) {
        return null;
    }
};

// 1. رفع صورة جديدة وتغيير الصورة الحالية
const handleUploadAvatar: RequestHandler = async (req, res, next) => {
    try {
        if(!req?.userId) throw new CustomError('User Id is Undefined!', 500)
        
        const userId: DecodedToken['userId'] = req.userId;

        if (!req.file) {
          res.status(400).json({ success: false, message: "لم يتم استقبال أي ملف" });
            return 
        }

        // رفع الصورة كـ Stream إلى Cloudinary
        const streamUpload = (fileBuffer: Buffer): Promise<CloudinaryUploadResult> => {

            return new Promise<CloudinaryUploadResult>((resolve, reject) => {
              
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
                    } satisfies CloudinaryUploadOptions,
                    (error: Error | undefined, result?: CloudinaryUploadResult) => {
                        if (result) resolve(result);
                        else reject(error ?? new Error('Cloudinary upload failed'));
                    }
                );
                
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };


        const uploadResult: CloudinaryUploadResult = await streamUpload(req.file.buffer);
        const imageUrl: string = uploadResult.secure_url;

        // تحديث قاعدة البيانات (الدالة الذكية المحدثة بالاستعلام الواحد)
        const result: SetAndUpdateAvatarUrlResponse | null = await AvatarService.updateAvatarUrl(userId, imageUrl);

        if (!result) throw new CustomError("User not found!", 404)

        res.status(200).json({
            success: true,
            message: "تم تحديث الصورة الشخصية بنجاح!",
            data: result,
        });
        
    } catch (err) {
        next(err);
    }
};


// 2. الحذف النهائي وتطهير السحابة
const handleDeleteAvatar: RequestHandler = async (req, res, next) => {
    try {
        if (!req?.userId) throw new CustomError('User Id is Undefined!', 500);

        const userId: DecodedToken['userId'] = req.userId;

        // جلب رابط الصورة الحالية لمسحها من Cloudinary قبل تصفيرها في قاعدة البيانات
        const result: DeleteAvatarUrlResponse = await AvatarService.deleteAvatarUrl(userId);

        if (!result) {
            res.status(404).json({ success: false, message: "المستخدم غير موجود" });
            return;
        }

        // استخراج الـ public_id وتطهير الملف القديم سحابياً إن لم تكن الصورة الافتراضية
        const publicId: string | null = getPublicIdFromUrl(result.avatar_url);

        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        res.status(200).json({
            success: true,
            message: "تم مسح الصورة الشخصية والعودة للوضع الافتراضي بنجاح",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// 3. دالة جديدة تماماً: اختيار صورة سابقة وتفعيلها
const handleSetAvatarFromHistory: RequestHandler = async (req, res, next) => {
    try {
        if(!req?.userId) throw new CustomError('User Id is Undefined!', 500)

        const userId: DecodedToken['userId'] = req.userId;
        const { chosenAvatarUrl }: SetAvatarFromHistoryType["body"] = req.body;

        // استدعاء الخدمة الذرية للتبديل السريع في قاعدة البيانات
        const result: SetAndUpdateAvatarUrlResponse | null = 
          await AvatarService.setAvatarFromHistory(userId, chosenAvatarUrl);

        if (!result) throw new CustomError("User not found!", 404)
        
        res.status(200).json({
            success: true,
            message: "تم تبديل وتعيين الصورة الشخصية من السجل بنجاح",
            data: result,
        });
    } catch (err) {
        // إدارة الأخطاء القادمة من الـ Service في حال التلاعب بالروابط
        if (err instanceof Error && err.message.includes("غير موجودة في سجل الصور")) {
            res.status(400).json({ success: false, message: err.message });
            return
        }
        next(err);
    }
};

export { 
    handleUploadAvatar, 
    handleDeleteAvatar,
    handleSetAvatarFromHistory 
};
