import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { ProductNavProvider } from "@/features/products/ProductNavProvider";
import CartSheet from "@/components/layout/cart-sheet";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <ProductNavProvider>
        <Navbar />
        <CartSheet />
        <main className="min-h-screen bg-background">
          {children}
        </main>
        <Footer />
      </ProductNavProvider>
    </CartProvider>
  );
}
