import { Request, Response } from "express";
import ProductRepository from "../repositories/ProductRepository";
import PromotionRepository from "../repositories/PromotionRepository";

class MenuController {
  async getMenu(_req: Request, res: Response) {
    const products = await ProductRepository.findAll({ visible: true });

    const today = new Date();
    const currentDay = today.getDay(); // 0 = domingo, 6 = sábado
    const currentMinutes = today.getHours() * 60 + today.getMinutes();

    const menu = [];

    for (const product of products) {
      const promotions = await PromotionRepository.findByProductId(product.id);

      // filtra promoções ativas
      const activePromotion = promotions.find((promo) => {
        if (!promo.days_of_week.includes(currentDay)) return false;

        const [sh, sm] = promo.start_time
          .split(":")
          .map((x) => parseInt(x, 10));
        const [eh, em] = promo.end_time.split(":").map((x) => parseInt(x, 10));

        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      });

      menu.push({
        ...product,
        price: activePromotion
          ? activePromotion.promotional_price
          : product.price,
        promotion: activePromotion ? activePromotion.description : null,
      });
    }

    res.json({ status: "success", data: menu });
  }
}

export default new MenuController();
