"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface ProductNavInfo {
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface ProductNavContextValue {
  productInfo: ProductNavInfo | null;
  setProductInfo: (info: ProductNavInfo | null) => void;
  isInRecommendationSection: boolean;
  setIsInRecommendationSection: (value: boolean) => void;
}

const ProductNavContext = createContext<ProductNavContextValue | null>(null);

export function ProductNavProvider({ children }: { children: ReactNode }) {
  const [productInfo, setProductInfo] = useState<ProductNavInfo | null>(null);
  const [isInRecommendationSection, setIsInRecommendationSection] = useState(false);

  return (
    <ProductNavContext.Provider
      value={{
        productInfo,
        setProductInfo,
        isInRecommendationSection,
        setIsInRecommendationSection,
      }}
    >
      {children}
    </ProductNavContext.Provider>
  );
}

export function useProductNav() {
  const ctx = useContext(ProductNavContext);
  if (!ctx) {
    throw new Error("useProductNav must be used within ProductNavProvider");
  }
  return ctx;
}
