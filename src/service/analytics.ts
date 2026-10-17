// src/service/analytics.ts
import { PaginationResponse, PageAndLimitType } from '#src/types/globalTypes.js'
import {MediasResponse,}from '#src/types/mediaType.js'
import pool from "#src/config/dbConn.js";

import {
  SystemCountersResponse,
  TotalStatusLinksResponse,
  StatusLinksRequest,
  ServerNameType,
  BrokenLinksResponse,
  GetMissingEpisodesByServerResponse,
  GetLockedTelegramLinksResponse,
} from "#src/types/analyticsType.js";

const Analytics = {
  // 1. General System Counters
  async getSystemCounters(): Promise<SystemCountersResponse> {
    const result = await pool.query(
      `SELECT 
          (SELECT COUNT(id)::int FROM medias) AS total_medias,
          (SELECT COUNT(id)::int FROM medias WHERE is_ready = true) AS ready_medias,
          (SELECT COUNT(id)::int FROM medias WHERE is_ready = false) AS not_ready_medias,

          (SELECT COUNT(id)::int FROM seasons) AS total_seasons,
          (SELECT COUNT(id)::int FROM episodes) AS total_episodes,
          (SELECT COUNT(id)::int FROM genres) AS total_genres,

          (SELECT COUNT(id)::int FROM download_tasks) AS total_tasks,
          (SELECT COUNT(id)::int FROM download_tasks WHERE status = 'processing') AS total_processing,
          (SELECT COUNT(id)::int FROM download_tasks WHERE status = 'idle') AS total_idle,
          (SELECT COUNT(id)::int FROM download_tasks WHERE status = 'failed') AS total_failed,
          
          (SELECT COUNT(id)::int FROM links) AS total_links,
          (SELECT COUNT(id)::int FROM links WHERE last_check_status = 'broken') AS count_broken_links,
          (SELECT COUNT(id)::int FROM links WHERE last_check_status = 'valid') AS count_valid_links,
          (SELECT COUNT(id)::int FROM links WHERE last_check_status = 'pending') AS count_pending_links,

          (SELECT COUNT(id)::int FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'telegram_direct')) AS missing_telegram,

          (SELECT COUNT(id)::int FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'doodstream')) AS missing_dood,

          (SELECT COUNT(id)::int FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'lulustream')) AS missing_lulu,

          (SELECT COUNT(id)::int FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'mixdrop')) AS missing_mixdrop,

          (SELECT COUNT(id)::int FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'streamtape')) AS missing_streamtape,

          (SELECT COUNT(id)::int FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'voe')) AS missing_voe,

          (SELECT COUNT(id)::int FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'vk')) AS missing_vk,

          (SELECT COUNT(id)::int FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'archive')) AS missing_archive`,
    );

    return (result.rows[0] || {}) as SystemCountersResponse;
  },

  // 2. Links Analytics
  async getTotalBrokenAndValidAndPendingLinks(
    status: StatusLinksRequest,
  ): Promise<TotalStatusLinksResponse[]> {
    const allowed: string[] = ["valid", "broken", "pending"];

    const targetStatus: StatusLinksRequest = allowed.includes(status) ? status : "broken";

    const result = await pool.query(
      `SELECT
        server_name,
        last_check_status,
        COUNT(server_name)::integer AS total
      FROM links
      WHERE last_check_status = $1
      GROUP BY server_name, last_check_status
      ORDER BY total DESC`,
      [targetStatus],
    );

    return result.rows as TotalStatusLinksResponse[];
  },

  // 4. Medias Analytics (Paginated)
  async getNotReadyMedias(
    { page = 1, limit = 20 }: PageAndLimitType,
    isExport: boolean = false,
  ): Promise<{ data: MediasResponse[]; pagination: PaginationResponse }> {
    const parsedPage: number = Math.max(1, Number(page) || 1);
    const parsedLimit: number = Math.max(1, Number(limit) || 20);
    const offset: number = (parsedPage - 1) * parsedLimit;

    const limitClause: "" | `LIMIT $1 OFFSET $2` = isExport ? "" : `LIMIT $1 OFFSET $2`;

    const queryParams: number[] = isExport ? [] : [parsedLimit, offset];

    const result = await pool.query(
      `SELECT *, COUNT(*) OVER()::integer AS full_count 
            FROM medias 
            WHERE is_ready = false 
            ORDER BY created_at DESC
            ${limitClause}`,
      queryParams,
    );

    const total: number = result.rows[0]?.full_count || 0;
    const data: MediasResponse[] = result.rows.map(({ full_count, ...item }) => item, );

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

  // 5. Broken Links Analytics (Paginated)
  async getBrokenLinks(
    { serverName, page = 1, limit = 20 }: ServerNameType,
    isExport: boolean = false,
  ): Promise<{
    data: BrokenLinksResponse[];
    pagination: PaginationResponse;
  }> {

    const parsedPage: number = Math.max(1, Number(page) || 1);
    const parsedLimit: number = Math.max(1, Number(limit) || 20);
    const offset: number = (parsedPage - 1) * parsedLimit;
    const limitClause: "" | "LIMIT $2 OFFSET $3" = isExport ? "" : `LIMIT $2 OFFSET $3`;

    const queryParams: (string | number)[] = isExport ? [serverName] : [serverName, parsedLimit, offset];
      

    const result = await pool.query(
      `SELECT 
          links.id,
          links.episode_id,
          links.server_name,
          links.url,
          links.last_check_status,
          links.created_at,
          links.last_check_at,
          links.error_message,
          links.check_count,
          episodes.episode_number, 
          episodes.media_id,
          medias.title,
          medias.is_ready,
          medias.media_type,
          seasons.season_number,
          COUNT(*) OVER()::integer AS full_count
        FROM links 
        JOIN episodes ON links.episode_id = episodes.id
        JOIN medias ON episodes.media_id = medias.id
        LEFT JOIN seasons ON episodes.season_id = seasons.id
        WHERE links.last_check_status = 'broken'
        AND links.server_name = $1
        ORDER BY links.last_check_at DESC
        ${limitClause}`,
      queryParams,
    );

    const total: number = result.rows[0]?.full_count || 0;
    const data: BrokenLinksResponse[] = result.rows.map( ( { full_count, ...item } ) => item, );

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

  // 6. Missing Episodes Analytics (Paginated)
  async getMissingEpisodesByServer(
    { serverName, page = 1, limit = 20 }: ServerNameType,
    isExport: boolean = false,
  ): Promise<{
    data: GetMissingEpisodesByServerResponse[];
    pagination: PaginationResponse;
  }> {
    const parsedPage: number = Math.max(1, Number(page) || 1);
    const parsedLimit: number = Math.max(1, Number(limit) || 20);
    const offset: number = (parsedPage - 1) * parsedLimit;

    const limitClause: "" | "LIMIT $2 OFFSET $3" = isExport ? "" : `LIMIT $2 OFFSET $3`;

    const queryParams: (string | number)[] = isExport ? [serverName] : [serverName, parsedLimit, offset];

    const result = await pool.query(
      `SELECT 
        episodes.*, 
        medias.title, 
        medias.media_type,
        medias.is_ready,
        seasons.season_number,
        COUNT(*) OVER()::integer AS full_count
      FROM episodes
      JOIN medias ON episodes.media_id = medias.id
      LEFT JOIN seasons ON episodes.season_id = seasons.id
      WHERE episodes.id NOT IN (
          SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = LOWER($1)
      )
      ORDER BY episodes.id ASC
      ${limitClause}`,
      queryParams,
    );

    const total: number = result.rows[0]?.full_count || 0;
    const data: GetMissingEpisodesByServerResponse[] = result.rows.map(({ full_count, ...item }) => item,);
      
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

  // 7. Locked Telegram Links Analytics (Paginated)
  async getLockedTelegramLinks(
    { page = 1, limit = 20 }: PageAndLimitType,
    isExport: boolean = false,
  ): Promise<{
    data: GetLockedTelegramLinksResponse[];
    pagination: PaginationResponse;
  }> {
    const parsedPage: number = Math.max(1, Number(page) || 1);
    const parsedLimit: number = Math.max(1, Number(limit) || 20);
    const offset: number = (parsedPage - 1) * parsedLimit;

    const limitClause: "" | `LIMIT $1 OFFSET $2` = isExport ? "" : `LIMIT $1 OFFSET $2`;

    const queryParams: number[] = isExport ? [] : [parsedLimit, offset];

    const result = await pool.query(
      `SELECT
        links.id,
        links.episode_id, 
        links.server_name, 
        links.url, 
        links.created_at,
        medias.is_ready,
        medias.media_type,
        medias.title,
        episodes.media_id,
        episodes.episode_number,
        seasons.season_number,
        COUNT(*) OVER()::integer AS full_count
      FROM links 
      JOIN episodes ON links.episode_id = episodes.id
      JOIN medias   ON episodes.media_id  = medias.id
      LEFT JOIN seasons ON episodes.season_id = seasons.id
      WHERE links.url LIKE '%=LOCKING%'
      AND links.server_name = 'telegram_direct'
      ORDER BY links.created_at DESC
      ${limitClause}`,
      queryParams,
    );

    const total: number = result.rows[0]?.full_count || 0;
    const data: GetLockedTelegramLinksResponse[] = result.rows.map(({ full_count, ...item }) => item,);

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
};

export default Analytics;
