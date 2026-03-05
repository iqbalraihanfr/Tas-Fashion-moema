import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as orderService from '@/services/order.service';
import * as orderRepo from '@/services/database/order.repository';
import * as productRepo from '@/services/database/product.repository';
import { AppError } from '@/lib/errors';
import { CartItem } from '@/context/cart-context';

// Mock the repositories
vi.mock('@/services/database/order.repository');
vi.mock('@/services/database/product.repository');

describe('Order Service Integration Tests', () => {
  const mockCheckoutInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '08123456789',
    address: 'Jl. Sudirman No. 1',
    city: 'Jakarta',
    postalCode: '12345'
  };

  const mockCartItem: CartItem = {
    id: 'prod-1',
    name: 'Luxury Tote',
    price: 1000000,
    quantity: 1,
    image: '/img.jpg',
    color: 'Black',
    slug: 'luxury-tote'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if cart is empty', async () => {
    await expect(orderService.placeOrder(mockCheckoutInput, []))
      .rejects
      .toThrow('Cart is empty');
  });

  it('should throw error if product does not exist', async () => {
    // Mock productRepo to return null
    vi.mocked(productRepo.getProductById).mockResolvedValue(null);

    await expect(orderService.placeOrder(mockCheckoutInput, [mockCartItem]))
      .rejects
      .toThrow('Product Luxury Tote not found');
  });

  it('should throw error if stock is insufficient', async () => {
    // Mock product with 0 stock
    vi.mocked(productRepo.getProductById).mockResolvedValue({
      id: 'prod-1',
      name: 'Luxury Tote',
      baseName: 'Luxury Tote',
      sku: 'LT-001',
      color: 'Black',
      dimensions: '30x40cm',
      stock: 0,
      price: 1000000,
      slug: 'luxury-tote',
      description: 'desc',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      is_archived: false,
      category: null,
    });

    await expect(orderService.placeOrder(mockCheckoutInput, [mockCartItem]))
      .rejects
      .toThrow('Product Luxury Tote is out of stock');
  });

  it('should create order and return WhatsApp URL on success', async () => {
    // 1. Mock Product (Sufficient Stock)
    vi.mocked(productRepo.getProductById).mockResolvedValue({
      id: 'prod-1',
      name: 'Luxury Tote',
      baseName: 'Luxury Tote',
      sku: 'LT-001',
      color: 'Black',
      dimensions: '30x40cm',
      stock: 10,
      price: 1000000,
      slug: 'luxury-tote',
      description: 'desc',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      is_archived: false,
      category: null,
    });

    // 2. Mock Order Creation
    const mockCreatedOrder = {
      id: 'ord-123',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '08123456789',
      address: 'Jl. Sudirman No. 1, Jakarta, 12345',
      subtotal: 1000000,
      shippingFee: 0,
      total: 1000000,
      paymentStatus: 'pending' as const,
      shippingStatus: 'idle' as const,
      trackingNumber: null,
      createdAt: new Date().toISOString()
    };
    vi.mocked(orderRepo.createOrder).mockResolvedValue(mockCreatedOrder);
    
    // 3. Mock Order Items Creation
    vi.mocked(orderRepo.createOrderItems).mockResolvedValue(undefined);

    // Act
    const result = await orderService.placeOrder(mockCheckoutInput, [mockCartItem]);

    // Assert
    expect(orderRepo.createOrder).toHaveBeenCalledTimes(1);
    expect(orderRepo.createOrderItems).toHaveBeenCalledTimes(1);
    expect(result.order).toEqual(mockCreatedOrder);
    expect(result.whatsappUrl).toContain('https://wa.me/');
    expect(result.whatsappUrl).toContain(encodeURIComponent('Luxury Tote (Black) x1'));
  });
});
