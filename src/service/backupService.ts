import { CustomError } from "#src/utils/customErr.js";
import { spawn, execSync } from "child_process";

const BackupService = {
  /**
   * يقوم بتنفيذ أمر pg_dump باستخدام رابط قاعدة البيانات المباشر ويعيد الـ stream
   */
  async generateBackupStream() {
    if (!process.env.DATABASE_URL) {
      throw new CustomError("DATABASE_URL is missing in environment variables!", 500);
    }

    // 💡 التحقق من وجود أداة pg_dump على السيرفر قبل البدء
    try {
      execSync("pg_dump --version", { stdio: "ignore" });
    } catch {
      throw new CustomError(
        "أداة pg_dump غير مثبتة أو غير متاحة في بيئة التشغيل الحالية (مثل Vercel). هذه الميزة تتطلب سيرفر حقيقي (VPS).",
        500
      );
    }

    let dbUrl: string = process.env.DATABASE_URL;

    // التحقق مما إذا كانت كلمة المرور تحتوي على @
    const atCount: number = (dbUrl.match(/@/g) || []).length;

    if (atCount > 1) {
      const lastAtIndex: number = dbUrl.lastIndexOf("@");
      const credentials: string = dbUrl.substring(0, lastAtIndex);
      const hostPart: string = dbUrl.substring(lastAtIndex);

      const fixedCredentials: string = credentials.replace(
        /(postgresql:\/\/.*?:)(.*)/,
        (_match, prefix, password) => {
          return prefix + password.replace(/@/g, "%40");
        }
      );

      dbUrl = fixedCredentials + hostPart;
    }

    // تنفيذ pg_dump
    const pgDump = spawn("pg_dump", [
      `--dbname=${dbUrl}`,
      "-O",
      "-x",
      "-F",
      "c",
    ]);

    pgDump.on("error", (err) => {
      throw new CustomError(`Failed to start backup process: ${err.message}`, 500);
    });

    return pgDump;
  },
};

export default BackupService;