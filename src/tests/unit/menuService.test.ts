import { MenuService } from "../../services/MenuService";
import ProductRepository from "../../repositories/ProductRepository";
import PromotionRepository from "../../repositories/PromotionRepository";
import { ProductCategory } from "../../models";
import * as timeUtils from "../../utils/time";

jest.mock("../../repositories/ProductRepository");
jest.mock("../../repositories/PromotionRepository");

describe("MenuService - Unit", () => {
  let menuService: MenuService;

  beforeEach(() => {
    jest.clearAllMocks();
    menuService = new MenuService();
  });

  describe("getMenuItems", () => {
    it("deve retornar produtos visíveis sem promoção", async () => {
      (ProductRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "prod-1",
          name: "Pizza",
          price: 50,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 1,
        },
      ]);
      (PromotionRepository.findAll as jest.Mock).mockResolvedValue([]);

      jest.spyOn(timeUtils, "getCurrentDayAndTimeInTimezone").mockReturnValue({
        currentDay: 1,
        currentTime: "12:00",
      });

      const result = await menuService.getMenuItems();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "prod-1",
        name: "Pizza",
        original_price: 50,
        current_price: 50,
        has_active_promotion: false,
      });
      expect(result[0].promotion).toBeUndefined();
    });

    it("deve aplicar promoção ativa", async () => {
      (ProductRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "prod-1",
          name: "Pizza",
          price: 50,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 1,
        },
      ]);

      (PromotionRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "promo-1",
          product_id: "prod-1",
          description: "Happy Hour",
          promotional_price: 25,
          days_of_week: [1],
          start_time: "18:00",
          end_time: "20:00",
        },
      ]);

      jest.spyOn(timeUtils, "getCurrentDayAndTimeInTimezone").mockReturnValue({
        currentDay: 1,
        currentTime: "19:00",
      });

      const result = await menuService.getMenuItems();

      expect(result[0]).toMatchObject({
        current_price: 25,
        has_active_promotion: true,
      });
      expect(result[0].promotion).toEqual({
        description: "Happy Hour",
        promotional_price: 25,
      });
    });

    it("NÃO deve aplicar promoção fora do horário", async () => {
      (ProductRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "prod-1",
          name: "Pizza",
          price: 50,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
        },
      ]);

      (PromotionRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "promo-1",
          product_id: "prod-1",
          description: "Happy Hour",
          promotional_price: 25,
          days_of_week: [1],
          start_time: "18:00",
          end_time: "20:00",
        },
      ]);

      jest.spyOn(timeUtils, "getCurrentDayAndTimeInTimezone").mockReturnValue({
        currentDay: 1,
        currentTime: "12:00",
      });

      const result = await menuService.getMenuItems();

      expect(result[0].has_active_promotion).toBe(false);
      expect(result[0].current_price).toBe(50);
    });

    it("NÃO deve aplicar promoção em dia errado", async () => {
      (ProductRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "prod-1",
          name: "Pizza",
          price: 50,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
        },
      ]);

      (PromotionRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "promo-1",
          product_id: "prod-1",
          description: "Happy Hour",
          promotional_price: 25,
          days_of_week: [1],
          start_time: "18:00",
          end_time: "20:00",
        },
      ]);

      jest.spyOn(timeUtils, "getCurrentDayAndTimeInTimezone").mockReturnValue({
        currentDay: 3,
        currentTime: "19:00",
      });

      const result = await menuService.getMenuItems();

      expect(result[0].has_active_promotion).toBe(false);
    });

    it("NÃO deve retornar produtos invisíveis", async () => {
      (ProductRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "prod-1",
          name: "Produto Visível",
          price: 50,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
        },
        {
          id: "prod-2",
          name: "Produto Invisível",
          price: 40,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: false,
        },
      ]);
      (PromotionRepository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await menuService.getMenuItems();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Produto Visível");
    });

    it("deve filtrar por categoria", async () => {
      (ProductRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "prod-1",
          name: "Entrada",
          price: 20,
          category: ProductCategory.ENTRADAS,
          visible: true,
        },
        {
          id: "prod-2",
          name: "Prato",
          price: 50,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
        },
      ]);
      (PromotionRepository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await menuService.getMenuItems(ProductCategory.ENTRADAS);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(ProductCategory.ENTRADAS);
    });

    it("deve ordenar por display_order", async () => {
      (ProductRepository.findAll as jest.Mock).mockResolvedValue([
        {
          id: "prod-1",
          name: "C",
          price: 30,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 3,
        },
        {
          id: "prod-2",
          name: "A",
          price: 10,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 1,
        },
        {
          id: "prod-3",
          name: "B",
          price: 20,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 2,
        },
      ]);
      (PromotionRepository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await menuService.getMenuItems();

      expect(result[0].name).toBe("A");
      expect(result[1].name).toBe("B");
      expect(result[2].name).toBe("C");
    });
  });
});
