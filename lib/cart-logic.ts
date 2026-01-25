import { CartItem } from "@/context/cart-context";

// Fundamental: Pure Function
// Input: Array of items -> Output: Number
// Tidak peduli state, database, atau UI.
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

// Fundamental: Immutability (Tidak mengubah array lama, tapi bikin baru)
// Logic: Kalau item udah ada, quantity nambah. Kalau belum, push baru.
export function addItemToCart(
  currentItems: CartItem[], 
  newItem: Omit<CartItem, "quantity">
): CartItem[] {
  const existingItemIndex = currentItems.findIndex(
    (item) => item.id === newItem.id && item.color === newItem.color
  );

  if (existingItemIndex > -1) {
    // Clone array biar aman (Best Practice Redux/React State)
    const updatedItems = [...currentItems];
    const existingItem = updatedItems[existingItemIndex];
    
    updatedItems[existingItemIndex] = {
      ...existingItem,
      quantity: existingItem.quantity + 1
    };
    
    return updatedItems;
  }

  return [...currentItems, { ...newItem, quantity: 1 }];
}
