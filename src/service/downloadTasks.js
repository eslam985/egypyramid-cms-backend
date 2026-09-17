const pool = require("../config/dbConn.js");

const DownLoadTask = {
    async createTask(data = {}) {
        // التحقق الصارم من وجود كائن محتوي على بيانات
        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data) ||
            Object.keys(data).length === 0
        ) {
            const err = new Error("Invalid or empty data provided");
            err.statusCode = 400;
            throw err;
        }

        const keys = Object.keys(data);
        const columns = keys.join(", ");
        const idx = keys.map((_, i) => `$${i + 1}`).join(", ");
        const values = Object.values(data);

        const result = await pool.query(
            `INSERT INTO download_tasks (${columns}) VALUES (${idx}) RETURNING *`,
            values,
        );

        return result.rows[0] || null;
    },
    async updateTaskById(id, data) {
        const seter = Object.keys(data)
            .map((k, i) => `${k} = $${i + 1}`)
            .join(", ");
        const idxId = `$${Object.keys(data).length + 1}`;
        const result = await pool.query(
            `UPDATE download_tasks SET ${seter} WHERE id = ${idxId} RETURNING *`,
            [...Object.values(data), id],
        );

        return result.rows[0] || null;
    },

    async getAllTasks({ order = "DESC", page = 1, limit = 20, search } = {}) {
        const ordering = order === "ASC" ? "ASC" : "DESC";

        const queryParams = [];
        const queryParamsCount = [];
        const conditions = [];

        if (search) {
            queryParams.push(`%${search}%`);
            queryParamsCount.push(`%${search}%`);
            conditions.push(
                `download_tasks.task_name ILIKE $${queryParams.length}`,
            );
        }

        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        const offset = (pageNum - 1) * limitNum;

        queryParams.push(limitNum);
        queryParams.push(offset);

        const limitClause = `LIMIT $${queryParams.length - 1}`;
        const offsetClause = `OFFSET $${queryParams.length}`;

        const [tasksResult, totalResult] = await Promise.all([
            pool.query(
                `SELECT * FROM download_tasks 
                ${whereClause}
                ORDER BY download_tasks.created_at ${ordering}
                ${limitClause}
                ${offsetClause}`,
                queryParams,
            ),
            pool.query(
                `SELECT COUNT(DISTINCT download_tasks.id) AS total_tasks FROM download_tasks
                ${whereClause}`,
                queryParamsCount,
            ),
        ]);

        const totalCount = parseInt(totalResult.rows[0].total_tasks, 10) || 0;

        return {
            data: tasksResult.rows,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPage: Math.ceil(totalCount / limitNum) || 1,
            },
        };
    },
    async findByTaskId(id) {
        const result = await pool.query(
            `SELECT * FROM download_tasks WHERE id = $1`,
            [id],
        );

        return result.rows[0] || null;
    },

    // SELECT * FROM download_tasks WHERE task_name LIKE '%Beauty and the Beast%' LIMIT 100;

    async findByTaskByName({ taskName, page = 1, limit = 20 }) {
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
        const offset = (parsedPage - 1) * parsedLimit;

        const targetTaskName = `%${taskName}%`;
        const result = await pool.query(
            `
            SELECT
                download_tasks.*,
                COUNT(*) OVER() AS full_count
            FROM
                download_tasks
            WHERE
                task_name ILIKE $1
            ORDER BY
                created_at DESC
            LIMIT
                $2
            OFFSET
                $3
        `,
            // تعديل مهم: تم استبدال parsedPage بـ parsedLimit ليعمل الـ LIMIT بشكل صحيح
            [targetTaskName, parsedLimit, offset],
        );

        // استخراج العدد الإجمالي من أول صف (إذا وُجدت نتائج)
        const total = parseInt(result.rows[0]?.full_count, 10) || 0;

        // فصل عمود full_count عن البيانات الأساسية لكل صف
        const data = result.rows.map(({ full_count, ...item }) => item);

        return {
            data,
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPage: Math.ceil(total / parsedLimit) || 1,
            },
        };
    },

    async deleteTaskById(id) {
        const result = await pool.query(
            `DELETE FROM download_tasks WHERE id = $1 RETURNING *`,
            [id],
        );

        return result.rows[0] || null;
    },
};

module.exports = DownLoadTask;
