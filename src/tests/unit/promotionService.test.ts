import PromotionService from "../../services/PromotionService";
import ProductRepository from "../../repositories/ProductRepository";
import PromotionRepository from "../../repositories/PromotionRepository";

jest.mock("../../repositories/ProductRepository");
jest.mock("../../repositories/PromotionRepository");

describe("PromotionService - Unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPromotion", () => {
    it("deve criar promoção válida", async () => {
      const mockPromotion = {
        id: "promo-123",
        product_id: "prod-1",
        description: "Happy Hour",
        promotional_price: 25,
        days_of_week: [1, 2, 3, 4, 5],
        start_time: "18:00:00",
        end_time: "20:00:00",
        created_at: new Date(),
        updated_at: new Date(),
      };

      (ProductRepository.exists as jest.Mock).mockResolvedValue(true);
      (PromotionRepository.create as jest.Mock).mockResolvedValue(
        mockPromotion
      );

      const result = await PromotionService.createPromotion({
        product_id: "prod-1",
        description: "Happy Hour",
        discount_percentage: 50,
        days_of_week: [1, 2, 3, 4, 5],
        start_time: "18:00",
        end_time: "20:00",
      });

      expect(result).toEqual(mockPromotion);
      expect(ProductRepository.exists).toHaveBeenCalledWith("prod-1");
      expect(PromotionRepository.create).toHaveBeenCalledTimes(1);
    });

    it("deve lançar erro se produto não existir", async () => {
      (ProductRepository.exists as jest.Mock).mockResolvedValue(false);

      await expect(
        PromotionService.createPromotion({
          product_id: "prod-inexistente",
          description: "Promo",
          discount_percentage: 50,
          days_of_week: [1],
          start_time: "18:00",
          end_time: "20:00",
        })
      ).rejects.toThrow("Produto não encontrado");

      expect(PromotionRepository.create).not.toHaveBeenCalled();
    });

    it("deve lançar erro se desconto for negativo", async () => {
      (ProductRepository.exists as jest.Mock).mockResolvedValue(true);

      await expect(
        PromotionService.createPromotion({
          product_id: "prod-1",
          description: "Promo",
          discount_percentage: -10,
          days_of_week: [1],
          start_time: "18:00",
          end_time: "20:00",
        })
      ).rejects.toThrow("Desconto deve estar entre 0 e 100");
    });

    it("deve lançar erro se desconto for > 100", async () => {
      (ProductRepository.exists as jest.Mock).mockResolvedValue(true);

      await expect(
        PromotionService.createPromotion({
          product_id: "prod-1",
          description: "Promo",
          discount_percentage: 150,
          days_of_week: [1],
          start_time: "18:00",
          end_time: "20:00",
        })
      ).rejects.toThrow("Desconto deve estar entre 0 e 100");
    });

    it("deve lançar erro se days_of_week estiver vazio", async () => {
      (ProductRepository.exists as jest.Mock).mockResolvedValue(true);

      await expect(
        PromotionService.createPromotion({
          product_id: "prod-1",
          description: "Promo",
          discount_percentage: 50,
          days_of_week: [],
          start_time: "18:00",
          end_time: "20:00",
        })
      ).rejects.toThrow();
    });
  });

  describe("updatePromotion", () => {
    it("deve atualizar promoção existente", async () => {
      const mockUpdated = {
        id: "promo-1",
        product_id: "prod-1",
        description: "Descrição Atualizada",
        promotional_price: 30,
        days_of_week: [1, 2],
        start_time: "19:00:00",
        end_time: "21:00:00",
        created_at: new Date(),
        updated_at: new Date(),
      };

      (PromotionRepository.findById as jest.Mock).mockResolvedValue({
        id: "promo-1",
        product_id: "prod-1",
      });
      (PromotionRepository.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await PromotionService.updatePromotion("promo-1", {
        description: "Descrição Atualizada",
      });

      expect(result).toEqual(mockUpdated);
    });

    it("deve lançar erro se promoção não existir", async () => {
      (PromotionRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        PromotionService.updatePromotion("promo-inexistente", {
          description: "Nova",
        })
      ).rejects.toThrow("Promoção não encontrada");
    });
  });
});
