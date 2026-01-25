import * as orderRepo from "./database/order.repository";
import * as productRepo from "./database/product.repository";
import { CheckoutInput } from "@/lib/validations/order";
import { CartItem } from "@/context/cart-context";
import { AppError } from "@/lib/errors";

export async function placeOrder(input: CheckoutInput, cartItems: CartItem[]) {
  if (cartItems.length === 0) {
    throw new AppError("Cart is empty", 400, "EMPTY_CART");
  }

  // 1. Basic Stock Check (Optional but recommended by guidelines)
  for (const item of cartItems) {
    const product = await productRepo.getProductById(item.id);
    if (!product) {
      throw new AppError(`Product ${item.name} not found`, 404, "PRODUCT_NOT_FOUND");
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Product ${item.name} is out of stock or insufficient`, 400, "OUT_OF_STOCK");
    }
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 0; // Free shipping for now
  const total = subtotal + shippingFee;

  // 2. Create Order Record
  const order = await orderRepo.createOrder({
    customerName: `${input.firstName} ${input.lastName}`,
    customerEmail: input.email,
    customerPhone: input.phone,
    address: `${input.address}, ${input.city}, ${input.postalCode}`,
    subtotal,
    shippingFee,
    total,
    paymentStatus: "pending",
    shippingStatus: "idle",
    trackingNumber: null,
  });

  // 3. Create Order Items
  const orderItems = cartItems.map(item => ({
    orderId: order.id,
    productId: item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  await orderRepo.createOrderItems(orderItems);

  // 4. Generate WhatsApp Link
  const whatsappUrl = generateWhatsAppLink(order, cartItems);

  return { order, whatsappUrl };
}

export async function updateOrderStatus(id: string, data: {
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingStatus: 'idle' | 'processing' | 'shipped' | 'delivered';
  trackingNumber: string | null;
}) {
  return await orderRepo.updateOrderStatus(id, data);
}

interface OrderSummary {
  id: string;
  customerName: string;
  total: number;
}

function generateWhatsAppLink(order: OrderSummary, cartItems: CartItem[]) {
  let message = "Halo MOEMA, saya ingin konfirmasi pesanan:\n";
  message += `Order ID: #${order.id.slice(0, 8)}\n`;
  message += `Nama: ${order.customerName}\n\n`;
  message += `Item Details:\n`;

  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (${item.color}) x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n`;
  });

  message += `\nTotal: Rp ${order.total.toLocaleString("id-ID")}\n`;
  message += `Mohon info ketersediaan & pembayaran. Terima kasih.`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/+628123456789?text=${encodedMessage}`; // Use the number from original code or config
}
