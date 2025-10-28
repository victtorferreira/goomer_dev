import { ProductCategory } from "./enums/product-category.enum";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  visible: boolean;
  display_order?: number;
  restaurant_timezone: string;
  created_at: Date;
  updated_at: Date;
}
