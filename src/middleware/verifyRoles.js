const verifyRoles = (requiredRole) => {
    return (req, res, next) => {
        // 1. التأكد من وجود الرول في الريكويست وقراءتها كرقم
        if (!req?.roles) return res.status(401).json({ success: false, message: "غير مصرح، يرجى تسجيل الدخول" });
        
        const userRole = parseInt(req.roles); 

        // 2. الآدمن (5150) يمتلك صلاحيات مطلقة ويمر من أي مسار فوراً
        if (userRole === 5150) return next();

        // 3. إذا كان المسار يتطلب آدمن فقط واليوزر ليس آدمن -> ممنوع
        if (requiredRole === 5150 && userRole !== 5150) {
            return res.status(403).json({ success: false, message: "هذا الإجراء متاح للآدمن فقط" });
        }

        // 4. إذا كان المسار يتطلب محرر (1984) -> يمر الاديتور فقط (لأن الآدمن تم تمريره في الخطوة 2)
        if (requiredRole === 1984) {
            if (userRole === 1984) return next();
            return res.status(403).json({ success: false, message: "هذا الإجراء يتطلب صلاحية محرر (Editor)" });
        }

        // 5. إذا كان المسار يتطلب يوزر عادي (2001) -> يمر الجميع (لأن الآدمن والاديتور أعلى صلاحية للـ Read)
        if (requiredRole === 2001) {
            return next();
        }

        return res.status(403).json({ success: false, message: "غير مصرح لك بالدخول" });
    };
};

module.exports = verifyRoles;
