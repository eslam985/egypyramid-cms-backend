

export interface MediasResponse {
  id: string;
  tmdb_id: string | null;
  title: string;
  story: string | null;
  poster_url: string | null;
  category: "movie" | "tv";
  year: string | null;
  rating: string | null;
  created_at: string;
  updated_at: string;
  labels: string;
  runtime: string | null;
  duration_iso: string | null;
  media_type: "movie" | "series";
  is_ready: boolean;
  is_notified: boolean;
  is_facebook_posted: boolean;
  facebook_posted_at: string;
  normalized_title: string;
  slug: string;
  genres?: (string | number | null)[] | null;
}

export interface MediaGenreResponse {
  media_id: string;
  genre_id: string;
}

export type AllowedColumnsInMedia = {
  title: "medias.title";
  category: "medias.category";
  year: "medias.year";
  is_ready: "medias.is_ready";
  created_at: "medias.created_at";
  rating: "medias.rating";
  runtime: "medias.runtime";
  media_type: "medias.media_type";
};

export interface FindMediaByAnyIdResponse {
  media_id: string
  media_title: string
  found_in: string
}