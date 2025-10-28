import PromotionRepository from "../repositories/PromotionRepository";
import ProductRepository from "../repositories/ProductRepository";
import { Promotion } from "../models";
import { AppError } from "../utils/AppError";
import { CreatePromotionDTO, UpdatePromotionDTO } from "../dtos";

class PromotionService {
  /**
   * Cria uma nova promoção.
   */
  async createPromotion(data: CreatePromotionDTO): Promise<Promotion> {
    await this.ensureProductExists(data.product_id);
    await this.validatePromotionalPrice(
      data.product_id,
      data.promotional_price
    );

    return PromotionRepository.create(data);
  }

  /**
   * Retorna todas as promoções (pode filtrar por produto).
   */
  async getAllPromotions(productId?: string): Promise<Promotion[]> {
    if (productId) {
      await this.ensureProductExists(productId);
    }

    return PromotionRepository.findAll(productId);
  }

  /**
   * Retorna uma promoção pelo ID.
   */
  async getPromotionById(id: string): Promise<Promotion> {
    return this.ensurePromotionExists(id);
  }

  /**
   * Atualiza uma promoção existente.
   */
  async updatePromotion(
    id: string,
    data: UpdatePromotionDTO
  ): Promise<Promotion> {
    const promotion = await this.ensurePromotionExists(id);

    if (data.promotional_price !== undefined) {
      await this.validatePromotionalPrice(
        promotion.product_id,
        data.promotional_price
      );
    }

    const updated = await PromotionRepository.update(id, data);
    if (!updated) {
      throw new AppError("Erro ao atualizar promoção", 500);
    }

    return updated;
  }

  /**
   * Deleta uma promoção.
   */
  async deletePromotion(id: string): Promise<void> {
    await this.ensurePromotionExists(id);

    const deleted = await PromotionRepository.delete(id);
    if (!deleted) {
      throw new AppError("Erro ao deletar promoção", 500);
    }
  }

  /**
   * Verifica se uma promoção existe.
   */
  private async ensurePromotionExists(id: string): Promise<Promotion> {
    const promotion = await PromotionRepository.findById(id);
    if (!promotion) {
      throw new AppError("Promoção não encontrada", 404);
    }
    return promotion;
  }

  /**
   * Verifica se um produto existe.
   */
  private async ensureProductExists(productId: string): Promise<void> {
    const exists = await ProductRepository.exists(productId);
    if (!exists) {
      throw new AppError("Produto não encontrado", 404);
    }
  }

  /**
   * Valida se o preço promocional é menor que o preço original.
   */
  private async validatePromotionalPrice(
    productId: string,
    promotionalPrice: number
  ): Promise<void> {
    const product = await ProductRepository.findById(productId);
    if (product && promotionalPrice >= product.price) {
      throw new AppError(
        "Preço promocional deve ser menor que o preço original",
        400
      );
    }
  }

  isPromotionActive(
    promo: { days_of_week: number[]; start_time: string; end_time: string },
    date: Date
  ): boolean {
    const day = date.getDay(); // 0 = domingo, 1 = segunda...
    if (!promo.days_of_week.includes(day)) return false;

    const [sh, sm] = promo.start_time.split(":").map(Number);
    const [eh, em] = promo.end_time.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
}

export default new PromotionService();
