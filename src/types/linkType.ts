export interface LinksResponse {
    id: string 
    episode_id: string 
    server_name: string
    url: string
    created_at: string
    link_type: string
    quality: string
    last_check_status: string | null
    last_check_at: string | null
    error_message: string | null
    check_count: number
    is_fixed: boolean
    last_success_at: string | null
    old_url: string | null
}

export type AllowedSortedLinkColumns = {
    last_check_status: "links.last_check_status",
    last_success_at: "links.last_success_at",
    last_check_at: "links.last_check_at",
    server_name: "links.server_name",
    check_count: "links.check_count",
    episode_id: "links.episode_id",
    created_at: "links.created_at",
    is_fixed: "links.is_fixed",
    quality: "links.quality",
    id: "links.id",
};