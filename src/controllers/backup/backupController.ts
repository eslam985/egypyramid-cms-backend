import BackupService from "#src/service/backupService.js";
import { CustomError } from "#src/utils/customErr.js";
import ROLES_LIST from "#src/config/roles_list.js";

import type { RequestHandler } from "express";

const handleDownloadBackup: RequestHandler = async (req, res, next) => {
  try {
    if (!req?.userId || Number(req?.roles) !== ROLES_LIST.Admin) throw new CustomError("غير مصرح لك بتحميل النسخة الاحتياطية", 403);

    const date: string = new Date().toISOString().slice(0, 10);

    // 💡 تغيير الامتداد إلى .dump ليناسب الصيغة المضغوطة الاحترافية لقواعد البيانات
    const fileName: string = `backup-${date}.dump`;

    const pgDumpProcess = await BackupService.generateBackupStream();

    // 💡 ميزة الحماية: لو أغلق الأدمن الصفحة أو عمل ريلود، نقتل عملية الـ pg_dump فوراً في السيرفر
    req.on("close", () => {
      if (pgDumpProcess && pgDumpProcess.kill) {
        console.log("⚠️ Client disconnected. Killing pg_dump process to save server resources...");
        pgDumpProcess.kill("SIGTERM"); // إغلاق العملية فوراً
      }
    });

    pgDumpProcess.stdout.on("data", (chunk) => {
      if (!res.headersSent) {
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", "application/octet-stream");
      }
      res.write(chunk);
    });

    let errorMessage = "";
    pgDumpProcess.stderr.on("data", (data) => {
      errorMessage += data.toString();
      console.error(`pg_dump internal error: ${data.toString()}`);
    });

    pgDumpProcess.on("close", (code) => {

      if (code !== 0) {
        console.error(`pg_dump process exited with code ${code}`);

        if (!res.headersSent) {
          res.status(500).json({ 
            success: false, 
            message: "فشل توليد النسخة الاحتياطية",
            error: errorMessage.trim() 
          });

          return
        }

        res.end();
      } else {
        res.end();
      }

    });

    pgDumpProcess.on("error", (err) => {

      console.error("Failed to start pg_dump:", err);

      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "pg_dump is not available" });
        return
      }

    });

  } catch (err) {
    next(err);
  }
};

export {
  handleDownloadBackup
};
