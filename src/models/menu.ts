import { ProductCategory } from "./enums/product-category.enum";

export interface MenuItemPromotion {
  description: string;
  promotional_price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: ProductCategory;
  original_price: number;
  current_price: number;
  has_active_promotion: boolean;
  promotion?: MenuItemPromotion;
  display_order?: number;
}

export interface MenuQueryParams {
  category?: ProductCategory;
  timezone?: string;
}
