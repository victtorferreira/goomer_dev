export interface Promotion {
  id: string;
  product_id: string;
  description: string;
  promotional_price: number;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
}
