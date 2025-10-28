import PromotionService from "../../services/PromotionService";
import ProductRepository from "../../repositories/ProductRepository";
import PromotionRepository from "../../repositories/PromotionRepository";
import { ProductCategory } from "../../models";

jest.mock("../../repositories/ProductRepository");
jest.mock("../../repositories/PromotionRepository");

describe("PromotionService", () => {
  it("cria promoção válida", async () => {
    (ProductRepository.exists as jest.Mock).mockResolvedValue(true);
    (ProductRepository.findById as jest.Mock).mockResolvedValue({
      id: "p1",
      price: 50,
      category: ProductCategory.PRATOS_PRINCIPAIS,
    });
    (PromotionRepository.create as jest.Mock).mockResolvedValue({
      id: "promo1",
      product_id: "p1",
      promotional_price: 30,
    });

    const promo = await PromotionService.createPromotion({
      product_id: "p1",
      description: "Promo teste",
      promotional_price: 30,
      days_of_week: [1],
      start_time: "10:00",
      end_time: "12:00",
    });

    expect(promo).toHaveProperty("id");
    expect(promo.promotional_price).toBe(30);
  });

  it("lança erro se preço promocional >= preço original", async () => {
    (ProductRepository.exists as jest.Mock).mockResolvedValue(true);
    (ProductRepository.findById as jest.Mock).mockResolvedValue({
      id: "p1",
      price: 20,
      category: ProductCategory.PRATOS_PRINCIPAIS,
    });

    await expect(
      PromotionService.createPromotion({
        product_id: "p1",
        description: "Promo inválida",
        promotional_price: 25,
        days_of_week: [1],
        start_time: "10:00",
        end_time: "12:00",
      })
    ).rejects.toThrow("Preço promocional deve ser menor que o preço original");
  });
});
