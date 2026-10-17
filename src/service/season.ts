import {BaseSeasonQueryType} from '#src/middleware/schemas/seasonSchema.js'
import { SeasonResponse, AllowedSortedSeasonColumns } from '#src/types/seasonType.js'
import pool from "#src/config/dbConn.js";
const Season = {
    async createSeason(media_id: number, season_number: number): Promise<SeasonResponse | null> {
        const result = await pool.query(
            `INSERT INTO seasons (media_id, season_number) VALUES($1, $2) RETURNING *`,
            [media_id, season_number],
        );

        return result.rows[0] || null;
    },
    async updateSeasonById(id: number, season_number: number): Promise<SeasonResponse | null> {
        const result = await pool.query(
            `UPDATE seasons 
            SET season_number = $1 
            WHERE id = $2 
            RETURNING *`,
            [season_number, id],
        );

        return result.rows[0] || null;
    },
    async findSeasonsByMediaId(media_id: number): Promise<SeasonResponse[] | null> {

        const result = await pool.query(
            `SELECT 
                seasons.*,
                COUNT(episodes.id)::integer AS episodes_count
            FROM seasons
            LEFT JOIN episodes ON episodes.season_id = seasons.id
            WHERE seasons.media_id = $1
            GROUP BY seasons.id
            ORDER BY seasons.season_number ASC`,
            [media_id],
        );

        return result.rows;
    },
    async findSeasonById(id: number): Promise<SeasonResponse | null> {
        const result = await pool.query(
            `SELECT * FROM seasons WHERE id = $1 LIMIT 1`,
            [id],
        );

        return result.rows[0] || null;
    },

    async deleteSeasonById(id: number): Promise<number | null>{
        const result = await pool.query(
            `DELETE FROM seasons WHERE id = $1 RETURNING *`,
            [id],
        );

        return result.rowCount
    },

        // 💡 دالة جديدة لجلب كل المواسم ودعم التصدير والـ Pagination
    async findAllSeasons(
      { page = 1, limit = 20, sortBy = "created_at", sortOrder = "DESC" }: BaseSeasonQueryType, 
      isExport: boolean = false
    ): Promise<SeasonResponse[]> {
        const queryParams: (number | string)[] = [];

        const allowedColumns: AllowedSortedSeasonColumns = {
          season_number: "seasons.season_number",
          created_at: "seasons.created_at",
          media_id: "seasons.media_id",
          id: "seasons.id",
        };
        // إلغاء الـ LIMIT والـ OFFSET لو كان الطلب تصدير (Export)
        const border = isExport ? "" : `LIMIT $1`;
        const skip = isExport ? "" : `OFFSET $2`;

        if (!isExport) {
            const limitNum = Number(limit);
            const offset = (Number(page) - 1) * limitNum;
            queryParams.push(limitNum, offset);
        }


        const orderByColumn = allowedColumns[sortBy] || "seasons.created_at";
        const orderDirection = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

        // استعلام جلب البيانات مع حساب عدد الحلقات لكل موسم ديناميكياً
        const seasonsResult = await pool.query(
            `SELECT 
                seasons.*,
                COUNT(episodes.id)::integer AS episodes_count
            FROM seasons
            LEFT JOIN episodes ON episodes.season_id = seasons.id
            GROUP BY seasons.id
            ORDER BY ${orderByColumn} ${orderDirection}
            ${border}
            ${skip}`,
            queryParams
        );

        return seasonsResult.rows;
    },


};

export default Season;
