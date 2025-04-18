// app/components/ClientProviders.tsx or somewhere similar

"use client";

import { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";
import { AuthProvider } from "@/contexts/auth-context";
import { WishlistProvider } from "@/components/wishlist-provider";
import { CartProvider } from "@/components/cart-provider";
import { CategoryProvider } from "@/contexts/category-context";
import { ProductProvider } from "@/contexts/product-context";
import { HomePageProvider } from "@/contexts/home-page-context";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <CookiesProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <CategoryProvider>
              <ProductProvider>
                <HomePageProvider>{children}</HomePageProvider>
              </ProductProvider>
            </CategoryProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </CookiesProvider>
  );
}
