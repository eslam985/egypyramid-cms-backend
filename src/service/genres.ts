import { CreateAndUpdateGenreType } from '#src/middleware/schemas/genreSchema.js'
import { GenresResponse } from '#src/types/genreType.js'
import { slugify } from "#src/utils/regex.js";
import pool from "#src/config/dbConn.js";

const Genres = {
  async createGenre(data: CreateAndUpdateGenreType): Promise<GenresResponse> {

    const slugGener: string = slugify(data.name); 

    const dbPayload = {
      name: data.name,
      slug: slugGener,
    };

    const columns: string = Object.keys(dbPayload).join(", ");

    const idx: string = Object.keys(dbPayload).map((_, i) => `$${i + 1}`).join(", ");

    const values: string[] = Object.values(dbPayload);

    const result = await pool.query(
      `INSERT INTO genres (${columns}) VALUES (${idx}) RETURNING *`,
      values,
    );
    
    return result.rows[0];
  },

  async updateGenreById(id: number, data: CreateAndUpdateGenreType): Promise<GenresResponse | null> {
    const slugGener = slugify(data.name);

    const dbPayload = {
      name: data.name,
      slug: slugGener,
    };

    const seter = Object.keys(dbPayload).map((c, i) => `${c} = $${i + 1}`).join(", ");
    const idx = `$${Object.keys(dbPayload).length + 1}`;
    const values = [...Object.values(dbPayload), id];

    const result = await pool.query(
      `UPDATE genres SET ${seter} WHERE id = ${idx} RETURNING *`,
      values,
    );

    return result.rows[0] || null;
  },

  async findAllGenres(): Promise<GenresResponse[]> {
    const result = await pool.query(`SELECT * FROM genres ORDER BY name ASC`);

    return result.rows;
  },


  async findGenreById(id: number): Promise<GenresResponse | null> {
    const result = await pool.query(`SELECT * FROM genres WHERE id = $1`, [id]);

    return result.rows[0] || null;
  },

  async findGenreByName(name: string): Promise<GenresResponse | null> {

    const result = await pool.query(
      `SELECT * FROM genres WHERE name ILIKE $1`,
      [name],
    );

    return result.rows[0] || null;
  },

  async deleteGenreById(id: number): Promise<number | null> {

    const result = await pool.query(
      `DELETE FROM genres WHERE id = $1 RETURNING *`,
      [id],
    );

    return result.rowCount
  },
};

export default Genres;
