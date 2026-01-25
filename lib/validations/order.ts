import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
