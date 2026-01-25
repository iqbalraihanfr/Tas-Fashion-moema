import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem } from "@/lib/types";
import { AppError } from "@/lib/errors";

export type CreateOrderDTO = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateOrderItemDTO = Omit<OrderItem, 'id'>;

export async function createOrder(data: CreateOrderDTO): Promise<Order> {
  const { data: order, error } = await supabaseAdmin
    .from('Order')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Repository Error [createOrder]:", error);
    throw new AppError("Failed to create order record", 500, "DATABASE_ERROR");
  }

  return order as Order;
}

export async function createOrderItems(items: CreateOrderItemDTO[]): Promise<void> {
  const { error } = await supabaseAdmin
    .from('OrderItem')
    .insert(items);

  if (error) {
    console.error("Repository Error [createOrderItems]:", error);
    throw new AppError("Failed to create order items", 500, "DATABASE_ERROR");
  }
}

export async function updateOrderStatus(id: string, data: {
  paymentStatus?: 'pending' | 'paid' | 'failed';
  shippingStatus?: 'idle' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string | null;
}): Promise<Order> {
  const { data: order, error } = await supabaseAdmin
    .from('Order')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Repository Error [updateOrderStatus]:", error);
    throw new AppError("Failed to update order status", 500, "DATABASE_ERROR");
  }

  return order as Order;
}
