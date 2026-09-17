// /egyPyramidDashbord/backend/src/middleware/logEvents.js
const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), "yyyy:MM:dd\tHH:mm:ss")}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    // على Vercel يتم الاعتماد على console.log فقط لأن نظام الملفات للقرأة فقط
    if (process.env.NODE_ENV === "production") {
        console.log(`[LOG]: ${logItem.trim()}`);
        return;
    }

    try {
        // تحديد المسار بناءً على مكان المجلد (هنا يستهدف backend/src/logs)
        const logsDir = path.join(__dirname, "..", "logs");

        if (!fs.existsSync(logsDir)) {
            await fsPromises.mkdir(logsDir);
        }
        await fsPromises.appendFile(path.join(logsDir, logName), logItem);
    } catch (err) {
        console.error("Failed to write log:", err);
    }
};

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqLog.txt");
    console.log(`${req.method} ${req.path}`);
    next();
};
module.exports = { logger, logEvents };
