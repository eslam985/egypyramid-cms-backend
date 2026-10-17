import { CreateTaskType, UpdateTaskByIdType } from '#src/middleware/schemas/downloadTaskSchema.js'
import { DownloadTasksResponse, GetAllTasksRequest } from '#src/types/downloadTasksType.js'
import { OrderingType, PaginationResponse } from '#src/types/globalTypes.js'
import pool from "#src/config/dbConn.js";


const DownLoadTask = {
  async createTask(data: CreateTaskType): Promise<DownloadTasksResponse> {
    const keys: string[] = Object.keys(data);
    const columns: string = keys.join(", ");
    const idx: string = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = Object.values(data);

    const result = await pool.query(
      `INSERT INTO download_tasks (${columns}) VALUES (${idx}) RETURNING *`,
      values,
    );

    return result.rows[0];
  },
  
  async updateTaskById(id: number, data: UpdateTaskByIdType): Promise<DownloadTasksResponse | null> {
    const seter: string = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(", ");

    const idxId: string = `$${Object.keys(data).length + 1}`;

    const result = await pool.query(
      `UPDATE download_tasks SET ${seter} WHERE id = ${idxId} RETURNING *`,
      [...Object.values(data), id],
    );

    return result.rows[0] || null;
  },

async getAllTasks(
  { order = "DESC", page = 1, limit = 20, search, status }: GetAllTasksRequest, 
  isExport: boolean = false
): Promise<{
    data: DownloadTasksResponse[];
    pagination: PaginationResponse;
}> {
    const ordering: OrderingType = order === "ASC" ? "ASC" : "DESC";

    const queryParams: (string | number)[] = [];
    const queryParamsCount:  string[] = [];
    const conditions: string[] = [];

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

    const whereClause: string =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const limitNum: number = limit;
    const pageNum: number = page;
    const offset: number = (pageNum - 1) * limitNum;


    const limitClause: string = isExport ? "" : `LIMIT $${queryParams.length + 1}`;
    const offsetClause: string = isExport ? "" : `OFFSET $${queryParams.length + 2}`;

    if (!isExport) {
      queryParams.push(limitNum);
      queryParams.push(offset);
    }

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

    const totalCount: number = parseInt(totalResult.rows[0].total_tasks, 10) || 0;

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
  async findByTaskId(id: number): Promise<DownloadTasksResponse | null> {
    const result = await pool.query(
      `SELECT * FROM download_tasks WHERE id = $1`,
      [id],
    );

    return result.rows[0] || null;
  },

  async deleteTaskById(id: number) {
    const result = await pool.query(
          `DELETE FROM download_tasks WHERE id = $1`,
      [id],
    );

      return result.rowCount // هترجع 1 لو اتمسح، 0 لو مكنش موجود
  },
  async deleteTasksByIds(ids: number[]): Promise<number | null> {
    
  const result = await pool.query(
    `DELETE FROM download_tasks WHERE id = ANY($1::int[])`,
    [ids]
  );

  return result.rowCount;
},
  async deleteAllTasksFailed(): Promise<number | null> {

  const result = await pool.query(
    `DELETE FROM download_tasks WHERE status = 'failed'`
  )

  return result.rowCount
}
};

export default DownLoadTask;
