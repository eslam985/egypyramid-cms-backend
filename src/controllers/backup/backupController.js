const BackupService = require("../../service/backupService");

const handleDownloadBackup = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const date = new Date().toISOString().slice(0, 10);
    // 💡 تغيير الامتداد إلى .dump ليناسب الصيغة المضغوطة الاحترافية لقواعد البيانات
    const fileName = `backup-${date}.dump`;

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
          return res.status(500).json({ 
            success: false, 
            message: "فشل توليد النسخة الاحتياطية",
            error: errorMessage.trim() 
          });
        }
        res.end();
      } else {
        res.end();
      }
    });

    pgDumpProcess.on("error", (err) => {
      console.error("Failed to start pg_dump:", err);
      if (!res.headersSent) {
        return res.status(500).json({ success: false, message: "pg_dump is not available" });
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleDownloadBackup
};
