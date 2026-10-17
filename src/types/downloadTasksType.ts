import { OrderingAndSearchType } from "#src/types/globalTypes.js";

export type TasksStatus = "processing" | "failed" | "idle";

export interface DownloadTasksResponse {
  id: string;
  task_name: string;
  source_url: string;
  status: TasksStatus;
  progress_percent: number;
  download_speed: string;
  status_message: string;
  created_at: string;
  updated_at: string;
  is_cancelled: boolean;
  trailer_url: string | null;
  normalized_task_name: string;
  task_year: string | null;
  fallback_urls: string[] | null;
}

export interface GetAllTasksRequest extends OrderingAndSearchType {
  status?: TasksStatus | undefined;
}
