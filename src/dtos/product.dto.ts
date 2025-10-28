import { ProductCategory } from "../models/enums/product-category.enum";

export interface CreateProductDTO {
  name: string;
  price: number;
  category: ProductCategory;
  visible?: boolean;
  display_order?: number;
  restaurant_timezone?: string;
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
  category?: ProductCategory;
  visible?: boolean;
  display_order?: number;
  restaurant_timezone?: string;
}
