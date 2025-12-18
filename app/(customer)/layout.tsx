import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import CartSheet from "@/components/layout/cart-sheet";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <Navbar />
      <CartSheet />
      <main className="min-h-screen bg-background">
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
