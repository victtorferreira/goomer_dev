import { Product, Promotion, MenuItem, ProductCategory } from "../models";
import {
  getCurrentDayAndTimeInTimezone,
  isPromotionActive,
} from "../utils/time";
import ProductRepository from "../repositories/ProductRepository";
import PromotionRepository from "../repositories/PromotionRepository";

export class MenuService {
  public async getMenuItems(
    category?: ProductCategory,
    timezone?: string
  ): Promise<MenuItem[]> {
    const products = await ProductRepository.findAll();
    const promotions = await PromotionRepository.findAll();

    const tz = timezone || "America/Sao_Paulo";
    const { currentDay, currentTime } = getCurrentDayAndTimeInTimezone(tz);

    const visibleProducts = products.filter(
      (p) => p.visible && (!category || p.category === category)
    );

    const menuItems: MenuItem[] = visibleProducts.map((product: Product) => {
      const activePromotion = this.findActivePromotionForProduct(
        product.id,
        promotions,
        currentDay,
        currentTime
      );

      const hasPromotion = !!activePromotion;
      const currentPrice = hasPromotion
        ? activePromotion!.promotional_price
        : product.price;

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        original_price: product.price,
        current_price: currentPrice,
        has_active_promotion: hasPromotion,
        promotion: hasPromotion
          ? {
              description: activePromotion!.description,
              promotional_price: activePromotion!.promotional_price,
            }
          : undefined,
        display_order: product.display_order,
      };
    });

    menuItems.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    return menuItems;
  }

  private findActivePromotionForProduct(
    productId: string,
    promotions: Promotion[],
    currentDay: number,
    currentTime: string
  ): Promotion | undefined {
    return promotions.find((promo) => {
      if (promo.product_id !== productId) return false;
      if (!promo.days_of_week.includes(currentDay)) return false;

      const active = isPromotionActive(
        promo.start_time,
        promo.end_time,
        currentTime
      );
      console.log("Promo check", {
        productId,
        currentDay,
        currentTime,
        promo,
        active,
      });
      return active;
    });
  }
}
