require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ناقص في ملف .env");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2, // خفض عدد الاتصالات المسموحة لكل Container على Vercel
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 10000,
});

// التعامل مع أخطاء الاتصالات الخاملة لمنع انهيار التطبيق
pool.on("error", (err) => {
    console.error("❌ Unexpected DB error on idle client:", err.message);
});

module.exports = pool;