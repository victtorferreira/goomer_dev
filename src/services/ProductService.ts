import ProductRepository from "../repositories/ProductRepository";
import PromotionRepository from "../repositories/PromotionRepository";
import { Product, ProductCategory } from "../models";
import { AppError } from "../utils/AppError";
import { CreateProductDTO, UpdateProductDTO } from "../dtos";

class ProductService {
  async createProduct(data: CreateProductDTO): Promise<Product> {
    if (!data.name) {
      throw new AppError("Nome é obrigatório", 400);
    }

    if (data.price === undefined) {
      throw new AppError("Preço é obrigatório", 400);
    }

    if (data.price <= 0) {
      throw new AppError("Preço deve ser positivo", 400);
    }

    return ProductRepository.create(data);
  }

  async getAllProducts(filters?: {
    category?: ProductCategory;
    visible?: boolean;
  }): Promise<Product[]> {
    return ProductRepository.findAll(filters);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await ProductRepository.findById(id);

    if (!product) {
      throw new AppError(`Produto com ID ${id} não encontrado`, 404);
    }

    return product;
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    await this.ensureProductExists(id);

    if (data.price !== undefined && data.price < 0) {
      throw new AppError("Preço deve ser positivo", 400);
    }

    const product = await ProductRepository.update(id, data);

    if (!product) {
      throw new AppError("Erro ao atualizar produto", 500);
    }

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.ensureProductExists(id);

    await PromotionRepository.deleteByProductId(id);

    const deleted = await ProductRepository.delete(id);

    if (!deleted) {
      throw new AppError("Erro ao deletar produto", 500);
    }
  }

  private async ensureProductExists(id: string): Promise<void> {
    const exists = await ProductRepository.exists(id);
    if (!exists) {
      throw new AppError(`Produto com ID ${id} não encontrado`, 404);
    }
  }
}

export default new ProductService();
