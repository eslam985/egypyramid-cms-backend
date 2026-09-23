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

async getAllTasks({ order = "DESC", page = 1, limit = 20, search, status } = {}) {
    const ordering = order === "ASC" ? "ASC" : "DESC";

    const queryParams = [];
    const queryParamsCount = [];
    const conditions = [];

    // شرط البحث بالاسم
    if (search) {
      queryParams.push(`%${search}%`);
      queryParamsCount.push(`%${search}%`);
      conditions.push(`download_tasks.task_name ILIKE $${queryParams.length}`);
    }

    // شرط الفلترة بالحالة (الإضافة الجديدة)
    if (status) {
      queryParams.push(status);
      queryParamsCount.push(status);
      conditions.push(`download_tasks.status = $${queryParams.length}`);
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

  async deleteTaskById(id) {
    const result = await pool.query(
          `DELETE FROM download_tasks WHERE id = $1`,
      [id],
    );

      return result.rowCount // هترجع 1 لو اتمسح، 0 لو مكنش موجود
  },
  async deleteTasksByIds(ids) {
  const result = await pool.query(
    `DELETE FROM download_tasks WHERE id = ANY($1::int[])`,
    [ids]
  );
  return result.rowCount;
},
  async deleteAllTasksFailed() {
  const result = await pool.query(
    `DELETE FROM download_tasks WHERE status = 'failed'`
  )
  return result.rowCount
}
};

module.exports = DownLoadTask;
