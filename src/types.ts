export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
}

export interface ProductWithReviews extends Product {
  avg_rating: number | null;
  review_count: number;
}

export type NewProduct = Omit<Product, 'id'>;

export interface CartItem extends Omit<Product, 'id'> {
  id: number;
  quantity: number;
}

export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
}

export interface OrderDetails {
  name: string;
  email: string;
  phone: string;
  deliveryMethod: 'delivery' | 'pickup';
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: string;
  customer_address: string | null;
  customer_city: string | null;
  customer_state: string | null;
  customer_zip: string | null;
  total_price: number;
  created_at: string;
}

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

export interface StoreSettings {
  id: number;
  store_name: string;
  logo_url: string;
  shop_address: string;
  instagram_id: string;
  whatsapp_number: string;
}

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
}
