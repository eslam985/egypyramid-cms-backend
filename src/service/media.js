// /projects/project_Full-stack/egyPyramidDashbord/backend/service/media.js
const pool = require("../config/dbConn.js");
const { slugify } = require("../utils/regex");

const Media = {
  // 8354-brothers-and-sisters
  async createMedia(data, genres = []) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. تجهيز المفاتيح والـ Slug المبدئي
      const cleanTitle = slugify(data.title);
      data.slug = cleanTitle;

      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

      // 2. إدخال الميديا
      const mediaRes = await client.query(
        `INSERT INTO medias (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      let media = mediaRes.rows[0];

      // 3. تحديث الـ Slug بالـ ID النهائي
      const finalSlug = `${media.id}-${slugify(media.normalized_title)}`;
      const slugRes = await client.query(
        `UPDATE medias SET slug = $1 WHERE id = $2 RETURNING *`,
        [finalSlug, media.id],
      );
      media = slugRes.rows[0];

      let insertedGenres = [];
      if (Array.isArray(genres) && genres.length > 0) {
        const genreValues = [media.id, ...genres];
        const genrePlaceholders = genres
          .map((_, i) => `($1, $${i + 2})`)
          .join(", ");

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
  async updateMediaById(id, { media = {}, genres } = {}) {
    // لو لم تُرسل أي بيانات للتحديث في media ولا في genres، اخرج فوراً
    const hasMediaData = media && Object.keys(media).length > 0;
    const hasGenreData = genres !== undefined;

    if (!hasMediaData && !hasGenreData) {
      const err = new Error("No data provided!");
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    let mediaResult = null;
    let genreResult = [];

    try {
      await client.query("BEGIN");

      if (Object.keys(media).length > 0) {
        const idxMedia = Object.keys(media)
          .map((f, i) => `${f} = $${i + 1}`)
          .join(", ");
        const res = await client.query(
          `UPDATE medias SET ${idxMedia} WHERE id = $${Object.keys(media).length + 1} RETURNING *`,
          [...Object.values(media), id],
        );
        mediaResult = res.rows[0] || null;
      }

      if (genres !== undefined) {
        await client.query(`DELETE FROM media_genres WHERE media_id = $1`, [
          id,
        ]);

        if (genres.length > 0) {
          // Bulk insert مرة واحدة بدل loop
          const values = [id, ...genres];
          const placeholders = genres
            .map((_, i) => `($1, $${i + 2})`)
            .join(", ");
          const res = await client.query(
            `INSERT INTO media_genres (media_id, genre_id) VALUES ${placeholders} RETURNING *`,
            values,
          );
          genreResult = res.rows;
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
      data: {
        ...mediaResult,
        genres: genreResult,
      },
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
  }) {
    const queryParams = [];
    const queryParamsCount = [];
    const conditions = [];

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

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const limitNum = Number(limit);
    const offset = (Number(page) - 1) * limitNum;

    queryParams.push(limitNum);
    queryParams.push(offset);

    const border = `LIMIT $${queryParams.length - 1}`;
    const skip = `OFFSET $${queryParams.length}`;

    const allowedColumns = {
      title: "medias.title",
      category: "medias.category",
      year: "medias.year",
      is_ready: "medias.is_ready",
      created_at: "medias.created_at",
    };

    const orderByColumn = allowedColumns[sortBy] || "medias.created_at";
    const orderDirection =
      String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

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

    const totalCount = parseInt(totalResult.rows[0].total_medias) || 0;

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
  async findMediaById(mediaId) {
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

  async findMediaByAnyId(id, targetTable = null) {
    if (!id) {
      const err = new Error("No Id Provided!");
      err.statusCode = 400;
      throw err;
    }

    const result = await pool.query(
      `SELECT * FROM find_media_by_id($1, $2);
        `,
      [id, targetTable],
    );

    return result.rows;
  },
  async deleteMediaById(id) {
    const result = await pool.query(
      `DELETE FROM medias WHERE id = $1 RETURNING *`,
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = Media;
