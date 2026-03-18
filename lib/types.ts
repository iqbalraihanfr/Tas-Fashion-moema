export type Product = {
  id: string;
  name: string;           // Full name with color, e.g., "Joanna Gray"
  baseName: string;       // Model name only, e.g., "Joanna"
  slug: string;           // URL-friendly, e.g., "joanna-gray"
  sku: string;            // Product code, e.g., "Y1886"
  color: string;          // Color variant, e.g., "Gray", "Pine Brown"
  dimensions: string;     // Size info, e.g., "45 cm x 45 cm"
  description: string;
  price: number;          // Price in IDR (integer, no decimals)
  stock: number;
  images: string[];       // Array of Supabase Storage URLs
  category: string | null; // Product category, e.g., "Totes", "Crossbody"
  is_archived: boolean;   // true = hidden from public storefront
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  slug: string;
  color: string;
  price: number;
  images: string[];
  stock: number;
};

export type ProductGroup = {
  baseName: string;
  category: string | null;
  variants: ProductVariant[]; // order follows the originating query's sort
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingStatus: 'idle' | 'processing' | 'shipped' | 'delivered';
  trackingNumber: string | null;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
};

export type Showcase = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
