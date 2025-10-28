import pool from "../config/database";
import { CreatePromotionDTO, UpdatePromotionDTO } from "../dtos";
import { Promotion } from "../models";
import { QueryResult } from "pg";

interface PromotionRow {
  id: string;
  product_id: string;
  description: string;
  promotional_price: string;
  days_of_week: string[];
  start_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
}

class PromotionRepository {
  private mapRowToPromotion(row: PromotionRow): Promotion {
    return {
      id: row.id,
      product_id: row.product_id,
      description: row.description,
      promotional_price: parseFloat(row.promotional_price),
      days_of_week: row.days_of_week.map((d) => Number(d)),
      start_time: row.start_time,
      end_time: row.end_time,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async create(data: CreatePromotionDTO): Promise<Promotion> {
    const query = `
      INSERT INTO promotions 
        (product_id, description, promotional_price, days_of_week, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.product_id,
      data.description,
      data.promotional_price,
      data.days_of_week,
      data.start_time,
      data.end_time,
    ];

    const result: QueryResult<PromotionRow> = await pool.query(query, values);
    return this.mapRowToPromotion(result.rows[0]);
  }

  async findAll(productId?: string): Promise<Promotion[]> {
    let query = `SELECT * FROM promotions`;
    const values: any[] = [];

    if (productId) {
      query += ` WHERE product_id = $1`;
      values.push(productId);
    }

    query += ` ORDER BY created_at DESC`;

    const result: QueryResult<PromotionRow> = await pool.query(query, values);
    return result.rows.map((row) => this.mapRowToPromotion(row));
  }

  async findById(id: string): Promise<Promotion | null> {
    const query = `SELECT * FROM promotions WHERE id = $1`;
    const result: QueryResult<PromotionRow> = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToPromotion(result.rows[0]) : null;
  }

  async findByProductId(product_id: string): Promise<Promotion[]> {
    const query = `SELECT * FROM promotions WHERE product_id = $1`;
    const result: QueryResult<PromotionRow> = await pool.query(query, [
      product_id,
    ]);
    return result.rows.map((row) => this.mapRowToPromotion(row));
  }

  async update(
    id: string,
    data: UpdatePromotionDTO
  ): Promise<Promotion | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(data.description);
      paramIndex++;
    }

    if (data.promotional_price !== undefined) {
      fields.push(`promotional_price = $${paramIndex}`);
      values.push(data.promotional_price);
      paramIndex++;
    }

    if (data.days_of_week !== undefined) {
      fields.push(`days_of_week = $${paramIndex}`);
      values.push(data.days_of_week);
      paramIndex++;
    }

    if (data.start_time !== undefined) {
      fields.push(`start_time = $${paramIndex}`);
      values.push(data.start_time);
      paramIndex++;
    }

    if (data.end_time !== undefined) {
      fields.push(`end_time = $${paramIndex}`);
      values.push(data.end_time);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE promotions
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);

    const result: QueryResult<PromotionRow> = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToPromotion(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM promotions WHERE id = $1`;
    const result: QueryResult = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByProductId(productId: string): Promise<void> {
    const query = `DELETE FROM promotions WHERE product_id = $1`;
    await pool.query(query, [productId]);
  }

  async exists(id: string): Promise<boolean> {
    const query = `SELECT 1 FROM promotions WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }
}

export default new PromotionRepository();
