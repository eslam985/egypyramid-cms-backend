import { PageAndLimitType } from "#src/types/globalTypes.js";

export interface SystemCountersResponse {
  total_medias: number;
  ready_medias: number;
  not_ready_medias: number;
  total_seasons: number;
  total_episodes: number;
  total_genres: number;
  total_tasks: number;
  total_processing: number;
  total_idle: number;
  total_failed: number;
  total_links: number;
  count_broken_links: number;
  count_valid_links: number;
  count_pending_links: number;
  missing_telegram: number;
  missing_dood: number;
  missing_lulu: number;
  missing_mixdrop: number;
  missing_streamtape: number;
  missing_voe: number;
  missing_vk: number;
  missing_archive: number;
}

export type StatusLinksRequest = "valid" | "broken" | "pending";

export interface TotalStatusLinksResponse {
  server_name: string;
  last_check_status: StatusLinksRequest;
  total: number;
}

export interface ServerNameType extends PageAndLimitType {
  serverName: string;
}

export interface BrokenLinksResponse {
  id: string; // bigint -> string
  episode_id: string; // bigint -> string
  media_id: string; // bigint -> string
  season_number: number | null; // integer -> number
  episode_number: number; // integer -> number
  check_count: number; // integer -> number
  server_name: string;
  url: string;
  last_check_status: StatusLinksRequest;
  created_at: string;
  last_check_at: string | null;
  error_message: string | null;
  title: string;
  is_ready: boolean;
  media_type: "movie" | "series";
}

export interface GetMissingEpisodesByServerResponse {
  id: string;
  media_id: string;
  episode_number: number;
  identifier: string;
  created_at: string;
  updated_at: string;
  status_message: string | null;
  progress_percent: number | null;
  download_speed: string | null;
  status: string | null;
  download_url: string | null;
  season_id: string;
  slug: string;
  title: string;
  media_type: "movie" | "series";
  is_ready: boolean;
  season_number: number;
}

export interface GetLockedTelegramLinksResponse {
  id: string;
  episode_id: string;
  server_name: string;
  url: string;
  created_at: string;
  is_ready: boolean;
  media_type: "movie" | "series";
  title: string;
  media_id: string;
  episode_number: number;
  season_number: number;
}
