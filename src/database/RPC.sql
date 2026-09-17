DROP FUNCTION IF EXISTS claim_links_by_server(TEXT, INT);

CREATE OR REPLACE FUNCTION claim_links_by_server(p_server_name TEXT, p_batch_limit INT)
RETURNS TABLE (
    id BIGINT,
    url TEXT,
    server_name TEXT,
    episode_id BIGINT,
    last_check_status TEXT,
    created_at TIMESTAMPTZ,
    last_check_at TIMESTAMPTZ,
    check_count INT
) AS $$
BEGIN
    RETURN QUERY
    WITH target_links AS (
        SELECT l.id
        FROM links l
        WHERE l.server_name ILIKE '%' || p_server_name || '%'
          AND (l.last_check_status IN ('pending', 'valid') OR l.url ILIKE '%disabled%' OR l.is_fixed = TRUE)
        ORDER BY l.last_check_at NULLS FIRST, l.last_check_status DESC, l.created_at ASC, l.check_count ASC
        LIMIT p_batch_limit
        FOR UPDATE SKIP LOCKED
    )
    UPDATE links
    SET last_check_at = NOW()
    WHERE links.id IN (SELECT target_links.id FROM target_links)
    RETURNING links.id, links.url, links.server_name, links.episode_id, links.last_check_status, links.created_at, links.last_check_at, links.check_count;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION claim_rescue_episodes(
    p_target_server TEXT,
    p_source_servers TEXT[],
    p_batch_size INT DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    episode_number INT,
    media_title TEXT,
    links JSONB
) AS $$
DECLARE
    v_ep_ids BIGINT[];
BEGIN
    -- 1. حجز الحلقات التي تملك مصادر بديلة ولا تملك رابط السيرفر المستهدف
    SELECT ARRAY_AGG(sub.id) INTO v_ep_ids
    FROM (
        SELECT e.id
        FROM episodes e
        WHERE EXISTS (
            SELECT 1 FROM links l
            WHERE l.episode_id = e.id
            AND LOWER(l.server_name) = ANY(p_source_servers)
            AND (l.last_check_at IS NULL OR l.last_check_at < NOW() - INTERVAL '30 minutes')
        )
        AND NOT EXISTS (
            SELECT 1 FROM links l
            WHERE l.episode_id = e.id
            AND LOWER(l.server_name) = LOWER(p_target_server)
        )
        ORDER BY e.id ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    ) sub;

    IF v_ep_ids IS NULL OR array_length(v_ep_ids, 1) IS NULL THEN
        RETURN;
    END IF;

    -- 2. تحديث last_check_at للمصادر المحجوزة
    UPDATE links
    SET last_check_at = NOW()
    WHERE episode_id = ANY(v_ep_ids)
    AND LOWER(server_name) = ANY(p_source_servers);

    -- 3. إرجاع بيانات الحلقات ومصادرها المتاحة
    RETURN QUERY
    SELECT
        e.id,
        e.episode_number,
        m.title AS media_title,
        jsonb_agg(
            jsonb_build_object('server_name', l.server_name, 'url', l.url)
        ) AS links
    FROM episodes e
    LEFT JOIN medias m ON m.id = e.media_id
    JOIN links l ON l.episode_id = e.id
    WHERE e.id = ANY(v_ep_ids)
      AND LOWER(l.server_name) = ANY(p_source_servers)
    GROUP BY e.id, e.episode_number, m.title;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION claim_telegram_sync_task(
    p_failed_ids INT[],
    p_source_servers TEXT[]
)
RETURNS JSONB AS $$
DECLARE
    v_episode RECORD;
    v_sources JSONB;
    v_fake_url TEXT;
BEGIN
    FOR v_episode IN
        SELECT e.id AS episode_id, e.episode_number, m.title, s.season_number
        FROM episodes e
        JOIN medias m ON m.id = e.media_id
        LEFT JOIN seasons s ON s.id = e.season_id
        WHERE NOT (e.id = ANY(COALESCE(p_failed_ids, '{}')))
          AND NOT EXISTS (
              SELECT 1 FROM links l 
              WHERE l.episode_id = e.id 
                AND LOWER(l.server_name) LIKE '%telegram_direct%'
          )
          AND EXISTS (
              SELECT 1 FROM links l 
              WHERE l.episode_id = e.id 
                AND l.server_name = ANY(p_source_servers)
          )
        ORDER BY e.id ASC
        FOR UPDATE OF e SKIP LOCKED
        LIMIT 1
    LOOP
        v_fake_url := 'https://yor-space.hf.space/stream/1?hash=LOCKING_' || floor(random() * 90000 + 10000)::text;

        INSERT INTO links (episode_id, url, server_name, quality, last_check_status)
        VALUES (v_episode.episode_id, v_fake_url, 'telegram_direct', '720p', 'processing');

        SELECT jsonb_agg(l.*) INTO v_sources
        FROM links l
        WHERE l.episode_id = v_episode.episode_id
          AND l.server_name = ANY(p_source_servers)
          AND LOWER(l.server_name) NOT LIKE '%telegram_direct%';

        RETURN jsonb_build_object(
            'episode_id', v_episode.episode_id,
            'title', COALESCE(v_episode.title, 'Unknown'),
            'ep_num', v_episode.episode_number,
            'season_num', v_episode.season_number,
            'fake_url', v_fake_url,
            'sources', v_sources
        );
    END LOOP;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION claim_episodes_for_repair(
    p_server_name TEXT,
    p_batch_size INT DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    episode_number INT,
    media_title TEXT,
    links JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM claim_rescue_episodes(
        p_server_name,
        ARRAY['archive', 'voe', 'doodstream', 'dood', 'mixdrop', 'streamtape', 'lulustream', 'vk', 'telegram_direct'],
        p_batch_size
    );
END;
$$ LANGUAGE plpgsql;