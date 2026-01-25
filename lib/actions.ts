"use server";

import { CartItem } from "@/context/cart-context";
import { signIn, signOut } from "../auth";
import { AuthError } from "next-auth";
import * as orderService from "@/services/order.service";
import { checkoutSchema } from "@/lib/validations/order";
import { AppError } from "@/lib/errors";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function handleSignOut() {
  await signOut();
}

export async function createOrder(formData: FormData, cartItems: CartItem[]) {
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
  };

  // 1. Validate Input with Zod
  const validated = checkoutSchema.safeParse(rawData);
  if (!validated.success) {
    return { 
      success: false, 
      error: validated.error.issues[0].message || "Invalid input data." 
    };
  }

  try {
    // 2. Delegate to Service Layer
    const { whatsappUrl } = await orderService.placeOrder(validated.data, cartItems);

    return { success: true, url: whatsappUrl };

  } catch (error) {
    console.error("Action Error [createOrder]:", error);
    
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "Failed to place order. Please try again." };
  }
}
