// /projects/project_Full-stack/egyPyramidDashbord/backend/service/media.js


import { PaginationResponse } from '#src/types/globalTypes.js'
import { CustomError } from "#src/utils/customErr.js";
import { slugify } from "#src/utils/regex.js"
import pool from "#src/config/dbConn.js";

import {
  CreateMediaType, 
  UpdateMediaType, 
  BaseMediasQueryType
} from '#src/middleware/schemas/mediaSchema.js'

import { 
  MediasResponse, 
  MediaGenreResponse, 
  AllowedColumnsInMedia, 
  FindMediaByAnyIdResponse 
} from '#src/types/mediaType.js'

const Media = {
  // 8354-brothers-and-sisters
  async createMedia(data: CreateMediaType, genres: (number | null)[]): Promise<{data: MediasResponse;}> {

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. تجهيز المفاتيح والـ Slug المبدئي
      const slugTitle: string = slugify(data.title);

      const dbPayload = {
        ...data,
        slug: slugTitle
      }

      const keys: string[] = Object.keys(dbPayload);
      const placeholders: string = keys.map((_, i) => `$${i + 1}`).join(", ");
      const values = Object.values(dbPayload);

      // 2. إدخال الميديا
      const mediaRes = await client.query(
        `INSERT INTO medias (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      
      let media = mediaRes.rows[0]

      // 3. تحديث الـ Slug بالـ ID النهائي
      const finalSlug: string = `${media.id}-${slugify(media.normalized_title)}`;
      
      const slugRes = await client.query(
        `UPDATE medias SET slug = $1 WHERE id = $2 RETURNING *`,
        [finalSlug, media.id],
      );

      media = slugRes.rows[0]

      let insertedGenres: { media_id: number; genre_id: number }[] = [];

      if (Array.isArray(genres) && genres.length > 0) {

        const genreValues: number[] = [media.id, ...genres];

        const genrePlaceholders: string = genres.map((_, i) => `($1, $${i + 2})`).join(", ");

        const genreRes = await client.query(
          `INSERT INTO media_genres (media_id, genre_id) VALUES ${genrePlaceholders} RETURNING *`,
          genreValues,
        );

        insertedGenres = genreRes.rows;
      }

      await client.query("COMMIT");

      // دمج التصنيفات بداخل كائن الميديا نفسه
      return {
        data: {
          ...media,
          genres: insertedGenres,
        },
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
  // : Promise<{ data: { media: {}; genreResult: number[]; } }>
  async updateMediaById(
      id: number, 
      { media, genres }: { media: UpdateMediaType; genres?: number[] }
    ): Promise<{ data: { media: MediasResponse | null; genreResult: MediaGenreResponse[]; } }>
  {
      const client = await pool.connect();

      let data: {
          media: MediasResponse | null;
          genreResult: MediaGenreResponse[];
        } = {
        media: null,
        genreResult: []
      }

      try {
        await client.query("BEGIN");

        if (Object.keys(media).length > 0) {
          const idxMedia = Object.keys(media).map((f, i) => `${f} = $${i + 1}`).join(", ");

          const res = await client.query(
            `UPDATE medias 
            SET 
              ${idxMedia} 
            WHERE id = $${Object.keys(media).length + 1} 
            RETURNING *`,
            [...Object.values(media), id],
          );

          if (!res.rows[0]) throw new CustomError("Media not found!", 404);

          data.media = res.rows[0];
        } else {
          const mediaRes = await client.query(`SELECT * FROM medias WHERE id = $1`, [id]);

          if (!mediaRes.rows[0]) throw new CustomError("Media not found!", 404);

          data.media = mediaRes.rows[0];
        }

        if (genres !== undefined) {
          await client.query(`DELETE FROM media_genres WHERE media_id = $1`, [id]);

          if (genres.length > 0) {
            const values: number[] = [id, ...genres];

            const placeholders = genres.map((_, i) => `($1, $${i + 2})`).join(", ");

            const res = await client.query(
              `INSERT INTO media_genres (media_id, genre_id) VALUES ${placeholders} RETURNING *`,
              values,
            );

            data.genreResult = res.rows;
          } else {
            data.genreResult = [];
          }

        }

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return {
        data,
      };
    },
  // findAllMedia
  async findAllMedia({
    category,
    page = 1,
    limit = 20,
    search,
    sortBy = "created_at",
    sortOrder = "DESC",
  }: BaseMediasQueryType, isExport: boolean = false): Promise<{
    data: MediasResponse[];
    pagination:PaginationResponse;
  }>
  { 
    const allowedColumns: AllowedColumnsInMedia = {
      title: "medias.title",
      category: "medias.category",
      year: "medias.year",
      is_ready: "medias.is_ready",
      created_at: "medias.created_at",
      rating: "medias.rating",
      runtime: "medias.runtime",
      media_type: "medias.media_type",
    };

    const orderDirection = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
    const orderByColumn = allowedColumns[sortBy] || "medias.created_at";
    const limitNum: number = Number(limit);
    const offset: number = (page - 1) * limitNum;
    const queryParams: (string | number)[] = [];
    const queryParamsCount: string[] = [];
    const conditions: string[] = [];


    if (category) {
      queryParams.push(category);
      queryParamsCount.push(category);
      conditions.push(`medias.category = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      queryParamsCount.push(`%${search}%`);
      conditions.push(`medias.normalized_title ILIKE $${queryParams.length}`);
    }

    const whereClause: string = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const border: string = isExport ? "" : `LIMIT $${queryParams.length + 1}`;
    const skip: string = isExport ? "" : `OFFSET $${queryParams.length + 2}`;

    if (!isExport) {
      queryParams.push(limitNum);
      queryParams.push(offset);
    }

    const [mediasResult, totalResult] = await Promise.all([
      pool.query(
        `SELECT 
          medias.*, 
          CASE 
              WHEN medias.media_type = 'series' OR medias.category = 'tv' 
              THEN (SELECT COUNT(*)::integer FROM seasons WHERE seasons.media_id = medias.id)
              ELSE 0
          END AS seasons_count,
          json_agg(json_build_object('id', genres.id, 'name', genres.name)) FILTER (WHERE genres.id IS NOT NULL) AS genres FROM medias
          LEFT JOIN media_genres ON medias.id = media_genres.media_id
          LEFT JOIN genres ON genres.id = media_genres.genre_id
          ${whereClause}
          GROUP BY medias.id
          ORDER BY ${orderByColumn} ${orderDirection}
          ${border}
          ${skip}`,
        queryParams,
      ),

      pool.query(
        `SELECT COUNT(DISTINCT medias.id) AS total_medias FROM medias
          ${whereClause}`,
        queryParamsCount,
      ),
    ]);

    const totalCount: number = parseInt(totalResult.rows[0].total_medias) || 0;

    return {
      data: mediasResult.rows,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: limitNum,
        totalPage: Math.ceil(totalCount / limitNum),
      },
    };
  },
  // findMediaById
  async findMediaById(mediaId: number): Promise<MediasResponse | null> {

    const result = await pool.query(
      `SELECT medias.*, json_agg(json_build_object('id', genres.id, 'name', genres.name)) FILTER (WHERE genres.id IS NOT NULL) AS genres FROM medias
            LEFT JOIN media_genres ON medias.id =  media_genres.media_id
            LEFT JOIN genres ON genres.id =  media_genres.genre_id
            WHERE medias.id = $1
            GROUP BY medias.id
            LIMIT 1`,
      [mediaId],
    );

    return result.rows[0] || null;
  },

  async findMediaByAnyId(id: number, targetTable = null): Promise<FindMediaByAnyIdResponse[]> {

    const result = await pool.query(
      `SELECT * FROM find_media_by_id($1, $2);
        `,
      [id, targetTable],
    );

    return result.rows;
  },
  async deleteMediaById(id: number): Promise<number | null> {

    const result = await pool.query(
      `DELETE FROM medias WHERE id = $1 RETURNING *`,
      [id],
    );

    return result.rowCount
  },
};

export default Media;
