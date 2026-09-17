const pool = require("../config/dbConn.js");

const Analytics = {
    // 1. General System Counters
    async getSystemCounters() {
        const result = await pool.query(
            `SELECT 
                (SELECT COUNT(id) FROM medias) AS total_medias,
                (SELECT COUNT(id) FROM medias WHERE is_ready = true) AS ready_medias,
                (SELECT COUNT(id) FROM medias WHERE is_ready = false) AS not_ready_medias,

                (SELECT COUNT(id) FROM seasons) AS total_seasons,
                (SELECT COUNT(id) FROM episodes) AS total_episodes,
                (SELECT COUNT(id) FROM genres) AS total_genres,

                (SELECT COUNT(id) FROM download_tasks) AS total_tasks,
                (SELECT COUNT(id) FROM download_tasks WHERE status = 'processing') AS total_processing,
                (SELECT COUNT(id) FROM download_tasks WHERE status = 'idle') AS total_idle,
                (SELECT COUNT(id) FROM download_tasks WHERE status = 'failed') AS total_failed,
                
                (SELECT COUNT(id) FROM links) AS total_links,
                (SELECT COUNT(id) FROM links WHERE last_check_status = 'broken') AS count_broken_links,
                (SELECT COUNT(id) FROM links WHERE last_check_status = 'valid') AS count_valid_links,
                (SELECT COUNT(id) FROM links WHERE last_check_status = 'pending') AS count_pending_links,

                (SELECT COUNT(id) FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'telegram_direct')) AS missing_telegram,
                (SELECT COUNT(id) FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'doodstream')) AS missing_dood,
                (SELECT COUNT(id) FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'lulustream')) AS missing_lulu,
                (SELECT COUNT(id) FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'mixdrop')) AS missing_mixdrop,
                (SELECT COUNT(id) FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'streamtape')) AS missing_streamtape,
                (SELECT COUNT(id) FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'voe')) AS missing_voe,
                (SELECT COUNT(id) FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'vk')) AS missing_vk,
                (SELECT COUNT(id) FROM episodes WHERE id NOT IN (SELECT DISTINCT episode_id FROM links WHERE LOWER(server_name) = 'archive')) AS missing_archive`,
        );

        return result.rows[0] || {};
    },

    // 2. Links Analytics
    async getTotalBrokenAndValidAndPendingLinks(status) {
        const allowed = ["valid", "broken", "pending"];
        const targetStatus = allowed.includes(status) ? status : "broken";

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
        return result.rows;
    },

    // 3. Tasks Analytics (Paginated)
    async getTasksByStatus({ status, page = 1, limit = 20 }) {
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
        const offset = (parsedPage - 1) * parsedLimit;

        const allowed = ["idle", "failed", "processing"];
        const targetStatus = allowed.includes(status) ? status : "idle";

        const result = await pool.query(
            `SELECT *, COUNT(*) OVER()::integer AS full_count 
            FROM download_tasks
            WHERE status = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3`,
            [targetStatus, parsedLimit, offset],
        );

        const total = result.rows[0]?.full_count || 0;
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

    // 4. Medias Analytics (Paginated)
    async getNotReadyMedias({ page = 1, limit = 20 }) {
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
        const offset = (parsedPage - 1) * parsedLimit;

        const result = await pool.query(
            `SELECT *, COUNT(*) OVER()::integer AS full_count 
            FROM medias 
            WHERE is_ready = false 
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2`,
            [parsedLimit, offset],
        );

        const total = result.rows[0]?.full_count || 0;
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

    // 5. Broken Links Analytics (Paginated)
    async getBrokenLinks({ serverName, page = 1, limit = 20 }) {
        if (!serverName) {
            const err = new Error("Server Name required!");
            err.statusCode = 400;
            throw err;
        }
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
        const offset = (parsedPage - 1) * parsedLimit;

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
        LIMIT $2 OFFSET $3`,
            [serverName, parsedLimit, offset],
        );

        const total = result.rows[0]?.full_count || 0;
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

    // 6. Missing Episodes Analytics (Paginated)
    async getMissingEpisodesByServer({ serverName, page = 1, limit = 20 }) {
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
        const offset = (parsedPage - 1) * parsedLimit;

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
            LIMIT $2 OFFSET $3`,
            [serverName, parsedLimit, offset],
        );

        const total = result.rows[0]?.full_count || 0;
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

    // 7. Locked Telegram Links Analytics (Paginated)
    async getLockedTelegramLinks({ page = 1, limit = 20 }) {
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
        const offset = (parsedPage - 1) * parsedLimit;

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
            LIMIT $1 OFFSET $2`,
            [parsedLimit, offset],
        );

        const total = result.rows[0]?.full_count || 0;
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
};

module.exports = Analytics;
