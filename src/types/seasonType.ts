
export interface SeasonResponse {
  id: string;
  media_id: string;
  season_number: number;
  created_at: string;
  episodes_count?: number
}
export type  AllowedSortedSeasonColumns  = {
    season_number: "seasons.season_number",
    created_at: "seasons.created_at",
    media_id: "seasons.media_id",
    id: "seasons.id",
};