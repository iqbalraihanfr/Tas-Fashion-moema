"use server";

import { CartItem } from "@/context/cart-context";
import { redirect } from "next/navigation";
import { signIn, signOut } from "../auth";
import { AuthError } from "next-auth";
import { supabaseAdmin } from '@/lib/supabase'; // Import supabaseAdmin client

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
  const customerName = formData.get("firstName") + " " + formData.get("lastName");
  const customerEmail = formData.get("email") as string;
  const customerPhone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const postalCode = formData.get("postalCode") as string;
  const city = formData.get("city") as string;

  // Calculate subtotal, shippingFee, total (dummy for now)
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 0; // Free shipping for now
  const total = subtotal + shippingFee;

  if (!customerName || !customerEmail || !customerPhone || !address || !city || !postalCode) {
    throw new Error("Missing required customer information.");
  }

  try {
    // 1. Create the Order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('Order') // Ensure table name matches exactly
      .insert({
        customerName,
        customerEmail,
        customerPhone,
        address: `${address}, ${city}, ${postalCode}`,
        subtotal,
        shippingFee,
        total,
        paymentStatus: "pending",
        shippingStatus: "idle",
      })
      .select('id') // Select the ID to use for order items
      .single();

    if (orderError) {
      console.error("Supabase Order Creation Error:", orderError);
      throw new Error("Failed to create order in database.");
    }

    if (!orderData?.id) {
      throw new Error("Order ID not returned after creation.");
    }

    // 2. Create Order Items
    const orderItemsToInsert = cartItems.map(item => ({
      orderId: orderData.id,
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: orderItemError } = await supabaseAdmin
      .from('OrderItem') // Ensure table name matches exactly
      .insert(orderItemsToInsert);

    if (orderItemError) {
      console.error("Supabase OrderItem Creation Error:", orderItemError);
      throw new Error("Failed to create order items in database.");
    }

    // Construct WhatsApp message
    let whatsappMessage = `Halo MOEMA, saya ingin memesan produk berikut:\n\n`;
    cartItems.forEach(item => {
      whatsappMessage += `- ${item.name} (${item.color}) x ${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n`;
    });
    whatsappMessage += `\nSubtotal: Rp ${subtotal.toLocaleString("id-ID")}`;
    whatsappMessage += `\nOngkir: Rp ${shippingFee.toLocaleString("id-ID")} (Gratis)`;
    whatsappMessage += `\nTotal: Rp ${total.toLocaleString("id-ID")}`;
    whatsappMessage += `\n\nNama: ${customerName}`;
    whatsappMessage += `\nEmail: ${customerEmail}`;
    whatsappMessage += `\nTelepon: ${customerPhone}`;
    whatsappMessage += `\nAlamat: ${address}, ${city}, ${postalCode}`;
    whatsappMessage += `\n\nNomor Pesanan Anda: ${orderData.id}\n`;
    whatsappMessage += `Mohon konfirmasi pesanan ini. Terima kasih.`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/+628123456789?text=${encodedMessage}`; // Replace with actual WA number

    // Redirect to WhatsApp
    redirect(whatsappUrl);

  } catch (error) {
    console.error("Failed to create order:", error);
    if (error instanceof Error) {
        throw error; // Re-throw custom errors
    }
    throw new Error("Failed to place order. Please try again.");
  }
}
