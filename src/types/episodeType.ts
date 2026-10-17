

export interface EpisodeResponse {
  id: string
  media_id: string
  episode_number: number
  identifier: string
  created_at: string
  updated_at: string
  status_message: string
  progress_percent: number
  download_speed: string
  status: string
  download_url: string | null
  slug: string
  links_count?: number
}

export type AllowedSortedEpisodeColumns = {
    episode_number: "e.episode_number",
    identifier: "e.identifier",
    created_at: "e.created_at",
    updated_at: "e.updated_at",
    media_id: "e.media_id",
    id: "e.id",
};