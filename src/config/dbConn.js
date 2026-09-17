require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ناقص في ملف .env");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 15000,
});

// هذا السطر يمنع السيرفر من الانهيار أثناء التشغيل عند انقطاع أي اتصال خامل
pool.on("error", (err) => {
    console.error("❌ Unexpected DB error on idle client:", err.message);
});

pool.connect()
    .then((client) => {
        console.log("✅ Postgres connected with pg Pool");
        client.release();
    })
    .catch((err) => {
        console.error("❌ DB Connection Error:", err.message);
    });

module.exports = pool;