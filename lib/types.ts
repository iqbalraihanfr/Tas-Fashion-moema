export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
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
  shippingStatus: 'idle' | 'processing' | 'shipped';
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
