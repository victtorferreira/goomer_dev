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
    console.log("==== Criando promoção ====");
    console.log("Dados recebidos:", data);

    // 1. Validar campos obrigatórios
    if (!data.product_id) throw new Error("product_id é obrigatório");
    if (!data.description) throw new Error("description é obrigatório");
    if (data.discount_percentage === undefined)
      throw new Error("discount_percentage é obrigatório");
    if (!data.days_of_week || data.days_of_week.length === 0)
      throw new Error("days_of_week é obrigatório e não pode ser vazio");
    if (!data.start_time) throw new Error("start_time é obrigatório");
    if (!data.end_time) throw new Error("end_time é obrigatório");

    if (data.discount_percentage < 0 || data.discount_percentage > 100) {
      throw new Error("Desconto inválido: deve estar entre 0 e 100.");
    }

    const productResult = await pool.query(
      "SELECT price FROM products WHERE id = $1",
      [data.product_id]
    );
    console.log("Resultado do produto:", productResult.rows[0]);

    if (!productResult.rows.length) {
      throw new Error("Produto não encontrado");
    }

    const priceRaw = productResult.rows[0].price;
    console.log("Preço bruto do produto:", priceRaw);
    console.log("Tipo do preço bruto:", typeof priceRaw);

    const productPrice = parseFloat(priceRaw);
    console.log("Preço após parseFloat:", productPrice);
    console.log("É NaN após parseFloat?", isNaN(productPrice));

    if (isNaN(productPrice) || productPrice <= 0) {
      throw new Error(
        `Produto sem preço definido ou preço inválido. Preço recebido: ${priceRaw}`
      );
    }
    console.log("Preço convertido para número:", productPrice);

    const discountMultiplier = 1 - data.discount_percentage / 100;
    console.log("Multiplicador de desconto:", discountMultiplier);

    const promotionalPrice =
      Math.round(productPrice * discountMultiplier * 100) / 100;

    console.log("Preço promocional calculado:", promotionalPrice);
    console.log("Tipo do preço promocional:", typeof promotionalPrice);
    console.log("É NaN o preço promocional?", isNaN(promotionalPrice));

    if (isNaN(promotionalPrice) || promotionalPrice < 0) {
      throw new Error("Erro ao calcular preço promocional");
    }

    const query = `
    INSERT INTO promotions 
      (product_id, description, promotional_price, days_of_week, start_time, end_time)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

    const values = [
      data.product_id,
      data.description,
      promotionalPrice,
      data.days_of_week,
      data.start_time,
      data.end_time,
    ];

    console.log("====== VALORES FINAIS ANTES DO INSERT ======");
    console.log("values:", JSON.stringify(values, null, 2));
    console.log("promotional_price (values[2]):", values[2]);
    console.log("typeof promotional_price:", typeof values[2]);
    console.log("============================================");

    console.log("Valores para o INSERT:", values);

    const result: QueryResult<PromotionRow> = await pool.query(query, values);
    console.log("Promoção inserida:", result.rows[0]);

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
    const current = await this.findById(id);
    if (!current) return null;

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(data.description);
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

    if (data.discount_percentage !== undefined) {
      if (data.discount_percentage < 0 || data.discount_percentage > 100) {
        throw new Error("Desconto inválido: deve estar entre 0 e 100.");
      }

      const productResult = await pool.query(
        "SELECT price FROM products WHERE id = $1",
        [current.product_id]
      );
      if (productResult.rows.length === 0) {
        throw new Error("Produto não encontrado");
      }
      const productPrice: number = parseFloat(productResult.rows[0].price);

      const promotionalPrice =
        Math.round(productPrice * (1 - data.discount_percentage / 100) * 100) /
        100;

      fields.push(`promotional_price = $${paramIndex}`);
      values.push(promotionalPrice);
      paramIndex++;
    }

    if (fields.length === 0) {
      return current;
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
