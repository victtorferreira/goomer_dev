export interface CreatePromotionDTO {
  product_id: string;
  description: string;
  discount_percentage: number;
  days_of_week: number[];
  start_time: string;
  end_time: string;
}

export interface UpdatePromotionDTO {
  description?: string;
  discount_percentage?: number;
  days_of_week?: number[];
  start_time?: string;
  end_time?: string;
}
