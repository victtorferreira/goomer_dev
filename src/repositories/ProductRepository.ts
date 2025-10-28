import pool from "../config/database";
import { CreateProductDTO, UpdateProductDTO } from "../dtos";
import { Product, ProductCategory } from "../models";
import { QueryResult } from "pg";

interface ProductRow {
  id: string;
  name: string;
  price: string;
  category: ProductCategory;
  visible: boolean;
  display_order: number | null;
  restaurant_timezone: string;
  created_at: Date;
  updated_at: Date;
}

class ProductRepository {
  private mapRowToProduct(row: ProductRow): Product {
    return {
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      category: row.category,
      visible: row.visible,
      display_order: row.display_order || undefined,
      restaurant_timezone: row.restaurant_timezone,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const query = `
      INSERT INTO products (name, price, category, visible, display_order, restaurant_timezone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.name,
      data.price,
      data.category,
      data.visible ?? true,
      data.display_order ?? null,
      data.restaurant_timezone ?? "America/Sao_Paulo",
    ];

    const result: QueryResult<ProductRow> = await pool.query(query, values);
    return this.mapRowToProduct(result.rows[0]);
  }

  async findAll(filters?: {
    category?: ProductCategory;
    visible?: boolean;
  }): Promise<Product[]> {
    let query = `
      SELECT * FROM products
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      query += ` AND category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters?.visible !== undefined) {
      query += ` AND visible = $${paramIndex}`;
      values.push(filters.visible);
      paramIndex++;
    }

    query += ` ORDER BY display_order ASC NULLS LAST, created_at DESC`;

    const result: QueryResult<ProductRow> = await pool.query(query, values);
    return result.rows.map((row) => this.mapRowToProduct(row));
  }

  async findById(id: string): Promise<Product | null> {
    const query = `
      SELECT * FROM products
      WHERE id = $1
    `;

    const result: QueryResult<ProductRow> = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToProduct(result.rows[0]) : null;
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }

    if (data.price !== undefined) {
      fields.push(`price = $${paramIndex}`);
      values.push(data.price);
      paramIndex++;
    }

    if (data.category !== undefined) {
      fields.push(`category = $${paramIndex}`);
      values.push(data.category);
      paramIndex++;
    }

    if (data.visible !== undefined) {
      fields.push(`visible = $${paramIndex}`);
      values.push(data.visible);
      paramIndex++;
    }

    if (data.display_order !== undefined) {
      fields.push(`display_order = $${paramIndex}`);
      values.push(data.display_order);
      paramIndex++;
    }

    if (data.restaurant_timezone !== undefined) {
      fields.push(`restaurant_timezone = $${paramIndex}`);
      values.push(data.restaurant_timezone);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);

    const result: QueryResult<ProductRow> = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToProduct(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM products
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM products
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }
}

export default new ProductRepository();
