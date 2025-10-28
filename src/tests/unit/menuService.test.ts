import { MenuService } from "../../services/MenuService";
import ProductRepository from "../../repositories/ProductRepository";
import PromotionRepository from "../../repositories/PromotionRepository";
import { ProductCategory } from "../../models";
import * as timeUtils from "../../utils/time";

jest.mock("../../repositories/ProductRepository");
jest.mock("../../repositories/PromotionRepository");

describe("MenuService", () => {
  it("retorna produtos com promoções aplicadas", async () => {
    (ProductRepository.findAll as jest.Mock).mockResolvedValue([
      {
        id: "p1",
        name: "Pizza",
        price: 50,
        category: ProductCategory.PRATOS_PRINCIPAIS,
        visible: true,
      },
    ]);

    (PromotionRepository.findAll as jest.Mock).mockResolvedValue([
      {
        id: "promo1",
        product_id: "p1",
        description: "Promoção de teste",
        promotional_price: 30,
        days_of_week: [1],
        start_time: "10:00",
        end_time: "12:00",
      },
    ]);

    // mocka o utilitário de tempo para simular segunda às 11h
    jest.spyOn(timeUtils, "getCurrentDayAndTimeInTimezone").mockReturnValue({
      currentDay: 1, // segunda
      currentTime: "11:00",
    });

    const service = new MenuService();
    const menu = await service.getMenuItems();

    expect(menu[0].current_price).toBe(30); // preço promocional aplicado
    expect(menu[0].has_active_promotion).toBe(true);
  });
});
