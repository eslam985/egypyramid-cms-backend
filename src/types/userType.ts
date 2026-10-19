import jwt from "jsonwebtoken";

export type RolesType = "2001" | "5150" | "1984";

export interface SetAndUpdateAvatarUrlResponse {
  id: string; // UUID
  username: string;
  avatar_url: string;
  avatar_history: string[] | null;
}

export interface UserResponse extends SetAndUpdateAvatarUrlResponse {
  email: string;
  roles: RolesType;
  created_at: string;
  updated_at: string;
}

export interface UserRequest {
  username: string;
  email: string;
  password: string;
  roles: RolesType;
}

export interface DeleteAvatarUrlResponse {
  id: string; // UUID
  username: string;
  avatar_url: string;
  avatar_history: string[] | null;
}

export interface FindUserByEmailResponse extends UserResponse {
  password: string;
}

export interface SessionResponse {
  id: string;
  user_id: string;
  refresh_token: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export type AllowedSessionColumnsType = {
  user_agent: "user_agent";
  ip_address: "ip_address";
  expires_at: "expires_at";
  created_at: "created_at";
  updated_at: "updated_at";
};

export interface FindByRefreshTokenResponse {
  id: string;
  username: string;
  email: string;
  password: string;
  refresh_token: string;
  refreshtoken: string;
  roles: RolesType;
}

export interface FindUserPasswordWithIdResponse {
  id: string;
  password: string;
}

export interface DecodedToken extends jwt.JwtPayload {
  userId: string;
  roles: RolesType;
  iat?: number;
  exp?: number;
}
