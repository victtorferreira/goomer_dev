export interface CreatePromotionDTO {
  product_id: string;
  description: string;
  promotional_price: number;
  days_of_week: number[];
  start_time: string;
  end_time: string;
}

export interface UpdatePromotionDTO {
  description?: string;
  promotional_price?: number;
  days_of_week?: number[];
  start_time?: string;
  end_time?: string;
}
