const { logEvents } = require("./logEvents");

const errorHandler = (err, req, res, next) => {
    // 1. تسجيل الخطأ في الملف والـ Console دائماً
    logEvents(`${err.name}: ${err.message}`, "errLog.txt");
    console.error(err.stack);

    // 2. خطأ الـ JSON غير السليم
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format provided in request body",
        });
    }

    // 3. خطأ تكرار البيانات من PostgreSQL
    if (err.code === "23505" || err.statusCode === 409) {
        return res.status(409).json({
            success: false,
            message: err.statusCode === 409 ? err.message : "Data already exists",
        });
    }

    // 4. خطأ المفتاح الأجنبي (Foreign Key Violation) أو العنصر غير موجود
    if (err.code === "23503" || err.statusCode === 404) {
        return res.status(404).json({
            success: false,
            message: err.statusCode === 404 ? err.message : "Referenced resource not found",
        });
    }
    
    // 5. باقي الأخطاء غير المتوقعة (Server Errors)
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;