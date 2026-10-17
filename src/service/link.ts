import { CreateLinkType, UpdateLinkByIdType, BaseLinkQueryType } from '#src/middleware/schemas/linkSchema.js'
import { LinksResponse, AllowedSortedLinkColumns } from '#src/types/linkType.js'
import { CustomError } from "#src/utils/customErr.js";
import pool from "#src/config/dbConn.js";

const Link = {
    async createLink(episode_id: number, data: CreateLinkType ): Promise<LinksResponse | null> {
        if (Object.keys(data).length === 0) throw new CustomError("NO Data provided!", 400)

        // دمج episode_id مع بقية البيانات في أوبجكت واحد
        const linkData = { episode_id, ...data };

        const columns: string = Object.keys(linkData).join(", ");
        const idx: string = Object.keys(linkData).map((_, i) => `$${i + 1}`).join(", ");
        const values = Object.values(linkData);

        const result = await pool.query(
            `INSERT INTO links (${columns}) VALUES (${idx}) RETURNING *`,
            values
        );

        return result.rows[0] || null;
    },

    async updateLinkById(id: number, data: UpdateLinkByIdType): Promise<LinksResponse | null> {
        // حماية: إذا لم تكن هناك بيانات للتعديل ارجع null فوراً
        if (Object.keys(data).length === 0) throw new CustomError("NO Data provided!", 400)

        const seter: string = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(", ");
        const idxId: string = `$${Object.keys(data).length + 1}`;
        const values = [...Object.values(data), id];

        const result = await pool.query(
            `UPDATE links SET ${seter} WHERE id = ${idxId} RETURNING *`,
            values
        );
        
        return result.rows[0] || null;
    },
    async findLinksByEpisodeId(episode_id: number): Promise<LinksResponse[]> {
        const result = await pool.query(
            `SELECT * FROM links WHERE episode_id = $1`,
            [episode_id]
        )
        
        return result.rows
    },
    async findLinkById(id: number): Promise<LinksResponse | null> {
        const result = await pool.query(
            `SELECT * FROM links WHERE id = $1`,
            [id]
        )
        
        return result.rows[0] || null
    },
    async deleteLinkById(id: number){
        const result = await pool.query(
            `DELETE FROM links WHERE id = $1 RETURNING *`,
            [id]
        )

        return result.rowCount
    },
    async findAllLinks(
      { page = 1, limit = 20, sortBy = "created_at", sortOrder = "DESC" }: BaseLinkQueryType, 
      isExport: boolean = false
    ): Promise<LinksResponse[]> {

        const allowedColumns: AllowedSortedLinkColumns = {
          last_check_status: "links.last_check_status",
          last_success_at: "links.last_success_at",
          last_check_at: "links.last_check_at",
          server_name: "links.server_name",
          check_count: "links.check_count",
          episode_id: "links.episode_id",
          created_at: "links.created_at",
          is_fixed: "links.is_fixed",
          quality: "links.quality",
          id: "links.id",
        };
        
        const queryParams: (string | number)[] = [];
        
        // إلغاء الـ LIMIT والـ OFFSET لو كان الطلب تصدير (Export)
        const border = isExport ? "" : `LIMIT $1`;
        const skip = isExport ? "" : `OFFSET $2`;

        if (!isExport) {
            const limitNum: number = Number(limit);
            const offset: number = (Number(page) - 1) * limitNum;
            queryParams.push(limitNum, offset);
        }

        const orderByColumn = allowedColumns[sortBy] || "links.created_at";
        const orderDirection = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

        const linksResult = await pool.query(
            `SELECT * FROM links
            ORDER BY ${orderByColumn} ${orderDirection}
            ${border}
            ${skip}`,
            queryParams
        );

        return linksResult.rows; 
    },

};

export default Link;
