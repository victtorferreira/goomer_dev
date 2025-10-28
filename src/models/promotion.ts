export interface Promotion {
  id: string;
  product_id: string;
  description: string;
  promotional_price: number;
  days_of_week: number[]; // padronizado como number[]
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  created_at: Date;
  updated_at: Date;
}
