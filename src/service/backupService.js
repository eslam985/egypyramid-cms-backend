const { spawn } = require('child_process');

const BackupService = {
    /**
     * يقوم بتنفيذ أمر pg_dump باستخدام رابط قاعدة البيانات المباشر ويعيد الـ stream
     */
    async generateBackupStream() {
        if (!process.env.DATABASE_URL) {
            const error = new Error("DATABASE_URL is missing in environment variables!");
            error.statusCode = 500;
            throw error;
        }

        // 💡 حل مشكلة الـ @ في كلمة المرور تلقائياً:
        // نقوم باستبدال حرف @ الموجود في كلمة المرور بـ %40 فقط إذا كان الرابط يحتوي على أكثر من علامة @
        let dbUrl = process.env.DATABASE_URL;
        
        // التحقق مما إذا كانت كلمة المرور تحتوي على @ (مما يسبب تكرار الـ @ في الرابط)
        const atCount = (dbUrl.match(/@/g) || []).length;
        if (atCount > 1) {
            // نقوم بفصل الرابط من آخر @ (وهي التي تفصل بين المضيف وبيانات الاعتماد)
            const lastAtIndex = dbUrl.lastIndexOf('@');
            const credentials = dbUrl.substring(0, lastAtIndex);
            const hostPart = dbUrl.substring(lastAtIndex);
            
            // نقوم بترميز الـ @ داخل جزء كلمة المستخدم والاصطلاحات فقط لـ %40
            // مع ترك أول @ التي تأتي بعد postgresql:// دون تغيير
            const fixedCredentials = credentials.replace(/(postgresql:\/\/.*?:)(.*)/, (match, prefix, password) => {
                return prefix + password.replace(/@/g, '%40');
            });
            
            dbUrl = fixedCredentials + hostPart;
        }

        // تنفيذ pg_dump وتمرير الإعدادات الآمنة المأخوذة من اسكربت الباش الخاص بك
        const pgDump = spawn('pg_dump', [
            `--dbname=${dbUrl}`,
            '-O', // 💡 تمنع حفظ صاحب قاعدة البيانات الأصلي (No Owners) لتسهيل الاسترجاع
            '-x', // 💡 تمنع حفظ صلاحيات المستخدمين (No Privileges)
            '-F', 'c' // 💡 تحويل إلى Custom Compressed Format (صيغة مضغوطة ذكية)
        ]);

        // التحقق في حال فشل بدء العملية
        pgDump.on('error', (err) => {
            const error = new Error(`Failed to start backup process: ${err.message}`);
            error.statusCode = 500;
            throw error;
        });

        return pgDump;
    }
};

module.exports = BackupService;
