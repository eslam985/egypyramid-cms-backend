import { Pool } from "pg";
import "dotenv/config";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ناقص في ملف .env");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

// التعامل مع أخطاء الاتصالات الخاملة لمنع انهيار التطبيق
pool.on("error", (err) => {
  console.error("❌ Unexpected DB error on idle client:", err.message);
});

export default pool;
