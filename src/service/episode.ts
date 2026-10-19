import { CreateEpisodeType, UpdateEpisodeType, BaseEpisodeQueryType } from '#src/middleware/schemas/episodeSchema.js'
import { EpisodeResponse, AllowedSortedEpisodeColumns } from '#src/types/episodeType.js'
import { MediasResponse } from '#src/types/mediaType.js'
import { CustomError } from "#src/utils/customErr.js";
import Media from "#src/service/media.js";
import pool from "#src/config/dbConn.js";
import { slugify } from '#src/utils/regex.js';

import { PageAndLimitType } from '#src/types/globalTypes.js'

// slug: 8359-when-calls-the-heart-episode-10
const Episode = {
    async createEpisode(
        media_id: number,
        { season_id = null, episode_number = 1, ...extraData }: CreateEpisodeType,
    ): Promise<EpisodeResponse | null> {
        const foundMedia: MediasResponse | null = await Media.findMediaById(media_id);

        if (!foundMedia) throw new CustomError("Media not found", 404)

        const title: string = ( foundMedia.normalized_title || foundMedia.title || "")
          
        const createSlug: string = `${foundMedia.id}-${slugify(title)}-episode-${episode_number}`;

        // تجميع كل البيانات مع الحقول الإضافية إن وجدت
        const episodeData: typeof extraData & {
            media_id: number;
            episode_number: number;
            slug: string;
            season_id?: number | null;
        } = {
            media_id,
            episode_number,
            slug: createSlug,
            ...extraData,
        };

        const isSeries: boolean = 
          season_id !== null && (foundMedia.category === "tv" || foundMedia.media_type === "series");

        if (isSeries) {
            episodeData.season_id = season_id;
        }

        const columns: string = Object.keys(episodeData).join(", ");
        const idx: string = Object.values(episodeData).map((_, i) => `$${i + 1}`).join(", ");
        const values = Object.values(episodeData);

        const result = await pool.query(
            `INSERT INTO episodes (${columns}) VALUES(${idx}) RETURNING *`,
            values,
        );

        return result.rows[0];
    },
    async updateEpisodeById(id: number, data: UpdateEpisodeType): Promise<EpisodeResponse | null> {
      
        if (Object.keys(data).length === 0) throw new CustomError("No data provided", 400)

        const seter: string = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(", ");
        const idxId: string = `$${Object.keys(data).length + 1}`;

        const result = await pool.query(
            ` UPDATE episodes 
            SET
              ${seter}
            WHERE id = ${idxId}
            RETURNING *`,
            [...Object.values(data), id],
        );

        return result.rows[0] || null;
    },

    async findEpisodeById(id: number): Promise<EpisodeResponse | null> {
        const result = await pool.query(
            `SELECT * FROM episodes WHERE id = $1`,
            [id],
        );

        return result.rows[0] || null;
    },

    async findEpisodesByMediaId(media_id: number, { page = 1, limit= 20 }: PageAndLimitType): Promise<EpisodeResponse[]> {
        const offset: number = (page - 1) * limit;

        const result = await pool.query(
            `SELECT e.*, (SELECT COUNT(*)::int FROM links l WHERE l.episode_id = e.id) AS links_count
            FROM episodes e 
            WHERE e.media_id = $1 
            ORDER BY e.episode_number ASC 
            LIMIT $2 OFFSET $3`,
            [media_id, limit, offset],
        );

        return result.rows;
    },

    async findEpisodesBySeasonId(season_id: number): Promise<EpisodeResponse[]> {
        const result = await pool.query(
          `SELECT e.*, (SELECT COUNT(*)::int FROM links l WHERE l.episode_id = e.id) AS links_count
            FROM episodes e 
            WHERE e.season_id = $1
            ORDER BY e.episode_number ASC`,
          [season_id],
        );

        return result.rows;
    },

    async deleteEpisodeById(id: number) {
        const result = await pool.query(
            `DELETE FROM episodes WHERE id = $1`,
            [id],
        );

        return result.rowCount
    },

        // 💡 دالة جديدة لجلب كل الحلقات في النظام ودعم التصدير والـ Pagination
    async findAllEpisodes(
      { page = 1, limit = 20, sortBy = "created_at", sortOrder = "DESC" }: BaseEpisodeQueryType, 
      isExport: boolean = false
    ): Promise<EpisodeResponse[]> {
        const allowedColumns: AllowedSortedEpisodeColumns = {
          episode_number: "e.episode_number",
          identifier: "e.identifier",
          created_at: "e.created_at",
          updated_at: "e.updated_at",
          media_id: "e.media_id",
          id: "e.id",
        };

        const queryParams: (string | number)[] = [];

        // إلغاء الـ LIMIT والـ OFFSET تماماً إذا كان طلب تصدير (Export)
        const border = isExport ? "" : `LIMIT $1`;
        const skip = isExport ? "" : `OFFSET $2`;

        if (!isExport) {
            const limitNum = Number(limit);
            const offset = (Number(page) - 1) * limitNum;
            queryParams.push(limitNum, offset);
        }


        const orderByColumn = allowedColumns[sortBy] || "e.created_at";
        const orderDirection = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

        // استعلام شامل يجلب الحلقات مع حساب عدد الروابط لكل حلقة ديناميكياً
        const episodesResult = await pool.query(
            `SELECT 
                e.*, 
                (SELECT COUNT(*)::int FROM links l WHERE l.episode_id = e.id) AS links_count
            FROM episodes e
            ORDER BY ${orderByColumn} ${orderDirection}
            ${border}
            ${skip}`,
            queryParams
        );

        return episodesResult.rows;
    },

};

export default Episode;
