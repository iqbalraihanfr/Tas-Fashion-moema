import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/services/product.service", () => ({
  createProduct: vi.fn(),
}));

vi.mock("@/services/order.service", () => ({
  updateOrderStatus: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as productService from "@/services/product.service";
import * as orderService from "@/services/order.service";
import { createProduct, updateOrderStatus } from "@/lib/admin-actions";

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects admin product creation when session is missing", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const formData = new FormData();
    formData.append("name", "Joanna Gray");
    formData.append("baseName", "Joanna");
    formData.append("sku", "Y1886");
    formData.append("color", "Gray");
    formData.append("dimensions", "45x45cm");
    formData.append("category", "Totes");
    formData.append("description", "Luxury tote");
    formData.append("price", "1500000");
    formData.append("stock", "10");

    const result = await createProduct(formData);

    expect(result).toEqual({
      success: false,
      error: "Your session has expired. Please sign in again.",
    });
    expect(productService.createProduct).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid order status payload", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1" },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const formData = new FormData();
    formData.append("orderId", "order-1");
    formData.append("paymentStatus", "paid");
    formData.append("shippingStatus", "unknown-status");

    const result = await updateOrderStatus(undefined, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(orderService.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("returns validation error for product creation without images", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1" },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const formData = new FormData();
    formData.append("name", "Joanna Gray");
    formData.append("baseName", "Joanna");
    formData.append("sku", "Y1886");
    formData.append("color", "Gray");
    formData.append("dimensions", "45x45cm");
    formData.append("category", "Totes");
    formData.append("description", "Luxury tote");
    formData.append("price", "1500000");
    formData.append("stock", "10");

    const result = await createProduct(formData);

    expect(result).toEqual({
      success: false,
      error: "At least one product image is required",
    });
    expect(productService.createProduct).not.toHaveBeenCalled();
  });

  it("updates order status and revalidates affected routes", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1" },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const formData = new FormData();
    formData.append("orderId", "order-123");
    formData.append("paymentStatus", "paid");
    formData.append("shippingStatus", "shipped");
    formData.append("trackingNumber", "RESI-001");

    const result = await updateOrderStatus(undefined, formData);

    expect(result).toEqual({ success: true });
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith("order-123", {
      paymentStatus: "paid",
      shippingStatus: "shipped",
      trackingNumber: "RESI-001",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/dashboard/orders/order-123");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/dashboard/orders");
  });
});
