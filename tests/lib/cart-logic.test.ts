import { describe, it, expect } from 'vitest';
import { calculateSubtotal, addItemToCart } from '@/lib/cart-logic';
import { CartItem } from '@/context/cart-context';

// Mock Data
const mockItem1: CartItem = { 
  id: '1', name: 'Tas A', price: 10000, quantity: 1, color: 'Red', image: 'img.jpg', slug: 'tas-a' 
};
const mockItem2: CartItem = { 
  id: '2', name: 'Tas B', price: 20000, quantity: 2, color: 'Blue', image: 'img.jpg', slug: 'tas-b' 
};

describe('Cart Logic (Pure Functions)', () => {
  
  describe('calculateSubtotal', () => {
    it('should return 0 for empty cart', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it('should calculate total correctly', () => {
      const items = [mockItem1, mockItem2];
      // (10.000 * 1) + (20.000 * 2) = 50.000
      expect(calculateSubtotal(items)).toBe(50000);
    });
  });

  describe('addItemToCart', () => {
    it('should add new item if cart is empty', () => {
      const result = addItemToCart([], mockItem1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ ...mockItem1, quantity: 1 });
    });

    it('should increment quantity if item exists with same ID and Color', () => {
      const initialCart = [mockItem1]; // qty: 1
      const result = addItemToCart(initialCart, mockItem1); // Add Tas A again
      
      expect(result).toHaveLength(1); // Tetap 1 item
      expect(result[0].quantity).toBe(2); // Qty jadi 2
    });

    it('should add as new item if ID same but Color different', () => {
      const itemRed = mockItem1;
      const itemBlue = { ...mockItem1, color: 'Blue' }; // Same ID, diff color

      const result = addItemToCart([itemRed], itemBlue);
      
      expect(result).toHaveLength(2); // Jadi 2 item terpisah
      expect(result[0].color).toBe('Red');
      expect(result[1].color).toBe('Blue');
    });
  });

});
