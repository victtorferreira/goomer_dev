import PromotionRepository from "../repositories/PromotionRepository";
import ProductRepository from "../repositories/ProductRepository";
import { Promotion } from "../models";
import { AppError } from "../utils/AppError";
import { CreatePromotionDTO, UpdatePromotionDTO } from "../dtos";

class PromotionService {
  async createPromotion(data: CreatePromotionDTO): Promise<Promotion> {
    await this.ensureProductExists(data.product_id);

    if (!data.days_of_week || data.days_of_week.length === 0) {
      throw new AppError("days_of_week não pode estar vazio", 400);
    }

    if (data.discount_percentage < 0 || data.discount_percentage > 100) {
      throw new AppError("Desconto deve estar entre 0 e 100", 400);
    }

    return PromotionRepository.create(data);
  }

  async getAllPromotions(productId?: string): Promise<Promotion[]> {
    if (productId) {
      await this.ensureProductExists(productId);
    }

    return PromotionRepository.findAll(productId);
  }

  async getPromotionById(id: string): Promise<Promotion> {
    return this.ensurePromotionExists(id);
  }

  async updatePromotion(
    id: string,
    data: UpdatePromotionDTO
  ): Promise<Promotion> {
    await this.ensurePromotionExists(id);

    if (data.discount_percentage !== undefined) {
      if (data.discount_percentage < 0 || data.discount_percentage > 100) {
        throw new AppError("Desconto deve estar entre 0 e 100", 400);
      }
    }

    const updated = await PromotionRepository.update(id, data);
    if (!updated) {
      throw new AppError("Erro ao atualizar promoção", 500);
    }

    return updated;
  }

  async deletePromotion(id: string): Promise<void> {
    await this.ensurePromotionExists(id);

    const deleted = await PromotionRepository.delete(id);
    if (!deleted) {
      throw new AppError("Erro ao deletar promoção", 500);
    }
  }

  private async ensurePromotionExists(id: string): Promise<Promotion> {
    const promotion = await PromotionRepository.findById(id);
    if (!promotion) {
      throw new AppError("Promoção não encontrada", 404);
    }
    return promotion;
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const exists = await ProductRepository.exists(productId);
    if (!exists) {
      throw new AppError("Produto não encontrado", 404);
    }
  }
}

export default new PromotionService();
