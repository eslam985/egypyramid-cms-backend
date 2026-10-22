import pool from "#src/config/dbConn.js";
import { 
  UserRequest, 
  UserResponse, 
  FindUserByEmailResponse, 
  SessionResponse, 
  AllowedSessionColumnsType, 
  FindByRefreshTokenResponse,
  FindUserPasswordWithIdResponse
} from '#src/types/userType.js'

import { UpdateUserByIdType } from '#src/middleware/schemas/userSchema.js'
import { OrderingType } from '#src/types/globalTypes.js'
import { CustomError } from '#src/utils/customErr.js'
import type { DeleteSessionsBy_uuidType } from "#src/middleware/schemas/userSchema.js";

const User = {
  async createNewUser({ username, email, password, roles = '2001' }: UserRequest): Promise<UserResponse> {

    const result = await pool.query(
      `INSERT INTO users 
        (username, email, password, roles) 
      VALUES 
        ($1, $2, $3, $4) 
      RETURNING 
        id, username, email, avatar_url, roles, avatar_url, created_at`,
      [username, email, password, roles],
    );

    return result.rows[0] 
  },

  async updateUserById(userId: string, data: UpdateUserByIdType['body']): Promise<UserResponse | null> {
    const keys: string[] = Object.keys(data);
    if (keys.length === 0) throw new CustomError('No Data provided!', 400)

    const seter: string = keys.map((c, i) => `${c} = $${i + 2}`).join(", ");
    const values = Object.values(data);

    const result = await pool.query(
      `UPDATE users 
      SET 
        ${seter}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING 
        id, username, email, avatar_url, roles, avatar_url, created_at`,
      [userId, ...values],
    );

    return result.rows[0] || null;
  },

  async changePassword(userId: string, newPassword: string): Promise<number | null> {

    const result = await pool.query(
      "UPDATE users SET password = $1, updated_at = now() WHERE id = $2",
      [newPassword, userId],
    );

    return result.rowCount; // سترجع true إذا تم التحديث بنجاح، و false إذا لم تجد المستخدم
  },
  async findUserById(userId: string): Promise<UserResponse | null> {
    const result = await pool.query(
      `SELECT 
        id, username, email, created_at, updated_at, avatar_url, avatar_history, roles
      FROM users 
      WHERE id = $1`,
      [userId],
    );

    return result.rows[0] || null;
  },
  async findUserPasswordWithId(userId: string): Promise<FindUserPasswordWithIdResponse | null> {
    const result = await pool.query(
      `SELECT id, password FROM users WHERE id = $1`,
      [userId],
    );

    return result.rows[0] || null;
  },

  async findByEmail(email: string): Promise<FindUserByEmailResponse | null> {
    const result = await pool.query(
      `SELECT 
        id, username, email, password, created_at, updated_at, avatar_url, avatar_history, roles 
      FROM users 
      WHERE email = $1`,
      [email],
    );

    return result.rows[0] || null;
  },

  async findByUsername(username: string): Promise<UserResponse | null> {
    const result = await pool.query(
      `SELECT 
        id, username, email, created_at, updated_at, avatar_url, avatar_history, roles
      FROM users 
      WHERE username = $1`,
      [username],
    );

    return result.rows[0] || null;
  },

  
  async createSession(
    userId: string, refreshToken: string, userAgent: string, ipAddress: string
  ): Promise<SessionResponse> {

    const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO sessions (user_id, refresh_token, user_agent, ip_address, expires_at) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, refreshToken, userAgent, ipAddress, expiresAt],
    );

    return result.rows[0];
  },

  async getSessionsByUserId(
    userId: string, 
    sortBy: keyof AllowedSessionColumnsType = "expires_at", 
    sortOrder: OrderingType = "ASC"
  ): Promise<SessionResponse[]> {

    if (!userId) throw new CustomError('User Id Is Required!', 400)

    const allowedColumns: AllowedSessionColumnsType = {
      user_agent: "user_agent",
      ip_address: "ip_address",
      expires_at: "expires_at",
      created_at: "created_at",
      updated_at: "updated_at",
    };

    const orderByColumn = allowedColumns[sortBy] || "expires_at";
    const orderDirection: OrderingType = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
      

    const result = await pool.query(
      `SELECT 
        id, user_id, user_agent, ip_address, expires_at, created_at, updated_at 
      FROM sessions 
      WHERE user_id = $1
      ORDER BY ${orderByColumn} ${orderDirection}
      `,
      [userId],
    );

    return result.rows;
  },

  async findByRefreshToken(token: string): Promise<FindByRefreshTokenResponse | null> {

    const result = await pool.query(
      `SELECT 
        u.id, u.username, u.email, u.password, s.refresh_token as refreshtoken, u.roles
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
      [token],
    );

    return result.rows[0] || null;
  },
async hasActiveSessions(userId: string): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1 FROM sessions WHERE user_id = $1 AND expires_at > NOW() LIMIT 1`,
        [userId]
    );
    return result.rows.length > 0;
},
  async refreshSession(token: string): Promise<number | null> {

    const newExpiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // تمديد 7 أيام جديدة

    const result = await pool.query(
      `UPDATE sessions 
        SET expires_at = $1, updated_at = NOW() 
        WHERE refresh_token = $2`,
      [newExpiresAt, token],
    );

    return result.rowCount;
  },

  async removeSessionRefreshToken(token: string): Promise<number | null> {

    const result = await pool.query(
      `DELETE FROM sessions WHERE refresh_token = $1`,
      [token],
    );

    return result.rowCount;
  },

  async removeSessionById(sessionId: DeleteSessionsBy_uuidType['body']['sessionId']): Promise<number | null> {

    const result = await pool.query(
      `DELETE FROM sessions WHERE id = $1`, 
      [sessionId,]
    );

    return result.rowCount;
  },

  async removeAllUserSessions(userId: string): Promise<number | null> {
    const result = await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [
      userId,
    ]);

    return result.rowCount;
  },
};

export default User;
