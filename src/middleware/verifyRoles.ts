import ROLES_LIST from "#src/config/roles_list.js";
import { CustomError } from "#src/utils/customErr.js";

import type { RequestHandler } from "express";


const verifyRoles = (requiredRole: number | string | undefined): RequestHandler => {
  const roleToVerify = typeof requiredRole === "string" ? parseInt(requiredRole, 10) : requiredRole;

  // فحص مبكر: إذا نسي المبرمج تمرير الرتبة أو مرر قيمة غير صالحة مثل NaN
  if (!roleToVerify || isNaN(roleToVerify)) {
    throw new CustomError("خطأ في إعداد المسار: يجب تمرير رتبة صالحة لـ verifyRoles (مثل ROLES_LIST.Admin)", 500)
  }

  return (req, res, next) => {

    // 1. التأكد من وجود الرتبة في الريكويست
    if (!req?.roles) {
      return res.status(401).json({ success: false, message: "غير مصرح، يرجى تسجيل الدخول" });
    }

    const userRole: number = typeof req.roles === "string" ? parseInt(req.roles, 10) : req.roles;

    // 2. الآدمن (Admin) يمتلك صلاحيات مطلقة ويمر من أي مسار فوراً
    if (userRole === ROLES_LIST.Admin) {
      return next();
    }

    // 3. إذا كان المسار يتطلب آدمن فقط
    if (roleToVerify === ROLES_LIST.Admin) {
      return res.status(403).json({ success: false, message: "هذا الإجراء متاح للآدمن فقط" });
    }

    // 4. إذا كان المسار يتطلب محرر (Editor) -> يمر المحرر فقط
    if (roleToVerify === ROLES_LIST.Editor) {
      if (userRole === ROLES_LIST.Editor) return next();
      return res.status(403).json({ success: false, message: "هذا الإجراء يتطلب صلاحية محرر (Editor)" });
    }

    // 5. إذا كان المسار يتطلب مستخدم عادي (User) -> يمر الجميع
    if (roleToVerify === ROLES_LIST.User) {
      return next();
    }

    return res.status(403).json({ success: false, message: "غير مصرح لك بالدخول" });
  };
};

export default verifyRoles;
