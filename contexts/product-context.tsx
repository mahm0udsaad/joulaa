"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload-helper";

// Update the Product interface to include variants
export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  cost?: number;
  profitMargin?: number;
  discount: number;
  image_urls: string[];
  category: string;
  stock_quantity: number;
  rating: number;
  reviews: number;
  colors?: { name: string; hex_value: string }[];
  shades?: { name: string; hex_value: string }[];
  variants?: { key: string; value: string }[];
  isDailyOffer?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define the context state
interface ProductContextState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  tableExists: boolean;
  hasRlsError: boolean;
}

// Update the context type to remove seedProducts
interface ProductContextType extends ProductContextState {
  addProduct: (
    product: Omit<
      Product,
      "id" | "createdAt" | "updatedAt" | "rating" | "reviews"
    >,
  ) => Promise<void>;
  updateProduct: (
    id: number,
    product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  setDailyOffer: (id: number, isDailyOffer: boolean) => Promise<void>;
  setFeatured: (id: number, isFeatured: boolean) => Promise<void>;
  setNewArrival: (id: number, isNewArrival: boolean) => Promise<void>;
  setBestSeller: (id: number, isBestSeller: boolean) => Promise<void>;
  refreshProducts: () => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
}

// Create the context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Create the provider component
export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProductContextState>({
    products: [],
    isLoading: true,
    error: null,
    tableExists: true,
    hasRlsError: false,
  });

  // Function to load products from Supabase
  const loadProducts = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Fetch products from Supabase
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id");

      if (error) {
        // Check if the error is because the table doesn't exist
        if (
          error.message.includes('relation "products" does not exist') ||
          error.message.includes('relation "public.products" does not exist')
        ) {
          console.log(
            "Products table does not exist yet. This is expected on first run.",
          );
          setState((prev) => ({
            ...prev,
            products: [],
            isLoading: false,
            error: null,
            tableExists: false,
            hasRlsError: false,
          }));
          return;
        }

        // Check if the error is because of RLS
        if (error.message.includes("row-level security")) {
          console.log(
            "Row Level Security is preventing access to the products table.",
          );
          setState((prev) => ({
            ...prev,
            products: [],
            isLoading: false,
            error:
              "Row Level Security is preventing access to the products table.",
            tableExists: true,
            hasRlsError: true,
          }));
          return;
        }

        throw error;
      }

      setState({
        products: data || [],
        isLoading: false,
        error: null,
        tableExists: true,
        hasRlsError: false,
      });
    } catch (error) {
      console.error("Failed to load products:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load products",
        tableExists: true,
        hasRlsError: false,
      }));
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  // Function to refresh products
  const refreshProducts = async () => {
    await loadProducts();
  };

  // Load data from Supabase on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Upload product image
  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      // Use the website bucket instead of products bucket to avoid RLS issues
      return await uploadImage(file, "website");
    } catch (error) {
      console.error("Error uploading product image:", error);
      throw error;
    }
  };

  // In the addProduct function, update the newProduct creation to ensure we're not explicitly setting the id
  const addProduct = async (
    product: Omit<
      Product,
      "id" | "createdAt" | "updatedAt" | "rating" | "reviews"
    >,
  ) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if table exists first
      if (!state.tableExists) {
        toast({
          title: "Database Error",
          description:
            "Products table does not exist. Please create it first by clicking the 'Seed Products' button.",
          variant: "destructive",
        });
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const timestamp = new Date().toISOString();

      // Create the product object without explicitly setting the id field
      // Let Postgres handle the id auto-increment
      const newProduct = {
        ...product,
        rating: 0,
        reviews: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      if (data && data.length > 0) {
        setState((prev) => ({
          ...prev,
          products: [...prev.products, data[0]],
          isLoading: false,
        }));

        toast({
          title: "Success",
          description: `Product "${product.name}" has been added`,
        });
      } else {
        throw new Error("No data returned from insert operation");
      }
    } catch (error) {
      console.error("Failed to add product:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to add product",
      }));

      // Check if the error is related to RLS
      if (
        error instanceof Error &&
        error.message.includes("row-level security")
      ) {
        setState((prev) => ({ ...prev, hasRlsError: true }));
      }

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      });
    }
  };

  // Update a product
  const updateProduct = async (
    id: number,
    product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
  ) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if table exists first
      if (!state.tableExists) {
        toast({
          title: "Database Error",
          description:
            "Products table does not exist. Please create it first by clicking the 'Seed Products' button.",
          variant: "destructive",
        });
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const updatedData = {
        ...product,
        updatedAt: new Date().toISOString(),
      };

      // Update in Supabase
      const { error } = await supabase
        .from("products")
        .update(updatedData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id
            ? {
                ...p,
                ...product,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
        isLoading: false,
      }));

      toast({
        title: "Success",
        description: `Product has been updated`,
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update product",
      }));

      // Check if the error is related to RLS
      if (
        error instanceof Error &&
        error.message.includes("row-level security")
      ) {
        setState((prev) => ({ ...prev, hasRlsError: true }));
      }

      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  // Delete a product
  const deleteProduct = async (id: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if table exists first
      if (!state.tableExists) {
        toast({
          title: "Database Error",
          description:
            "Products table does not exist. Please create it first by clicking the 'Seed Products' button.",
          variant: "destructive",
        });
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Delete from Supabase
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
        isLoading: false,
      }));

      toast({
        title: "Success",
        description: `Product has been deleted`,
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to delete product",
      }));

      // Check if the error is related to RLS
      if (
        error instanceof Error &&
        error.message.includes("row-level security")
      ) {
        setState((prev) => ({ ...prev, hasRlsError: true }));
      }

      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Get a product by ID
  const getProductById = async (id: number): Promise<Product | undefined> => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      console.log("Query results:", { data, error });

      if (error) {
        console.error("Supabase error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return undefined;
      }

      if (!data) {
        console.warn(`No product found with ID: ${id}`);
        return undefined;
      }

      return data;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return undefined;
    }
  };

  // Set daily offer status
  const setDailyOffer = async (id: number, isDailyOffer: boolean) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("products")
        .update({
          isDailyOffer,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id
            ? {
                ...p,
                isDailyOffer,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
        isLoading: false,
      }));

      toast({
        title: "Success",
        description: isDailyOffer
          ? `Product has been set as daily offer`
          : `Product has been removed from daily offers`,
      });
    } catch (error) {
      console.error("Failed to update daily offer status:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update daily offer status",
      }));

      // Check if the error is related to RLS
      if (
        error instanceof Error &&
        error.message.includes("row-level security")
      ) {
        setState((prev) => ({ ...prev, hasRlsError: true }));
      }

      toast({
        title: "Error",
        description: "Failed to update daily offer status",
        variant: "destructive",
      });
    }
  };

  // Set featured status
  const setFeatured = async (id: number, isFeatured: boolean) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("products")
        .update({
          isFeatured,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id
            ? {
                ...p,
                isFeatured,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
        isLoading: false,
      }));

      toast({
        title: "Success",
        description: isFeatured
          ? `Product has been added to featured products`
          : `Product has been removed from featured products`,
      });
    } catch (error) {
      console.error("Failed to update featured status:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update featured status",
      }));

      // Check if the error is related to RLS
      if (
        error instanceof Error &&
        error.message.includes("row-level security")
      ) {
        setState((prev) => ({ ...prev, hasRlsError: true }));
      }

      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  // Set new arrival status
  const setNewArrival = async (id: number, isNewArrival: boolean) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("products")
        .update({
          isNewArrival,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id
            ? {
                ...p,
                isNewArrival,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
        isLoading: false,
      }));

      toast({
        title: "Success",
        description: isNewArrival
          ? `Product has been added to new arrivals`
          : `Product has been removed from new arrivals`,
      });
    } catch (error) {
      console.error("Failed to update new arrival status:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update new arrival status",
      }));

      // Check if the error is related to RLS
      if (
        error instanceof Error &&
        error.message.includes("row-level security")
      ) {
        setState((prev) => ({ ...prev, hasRlsError: true }));
      }

      toast({
        title: "Error",
        description: "Failed to update new arrival status",
        variant: "destructive",
      });
    }
  };

  // Set best seller status
  const setBestSeller = async (id: number, isBestSeller: boolean) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("products")
        .update({
          isBestSeller,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id
            ? {
                ...p,
                isBestSeller,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
        isLoading: false,
      }));

      toast({
        title: "Success",
        description: isBestSeller
          ? `Product has been added to best sellers`
          : `Product has been removed from best sellers`,
      });
    } catch (error) {
      console.error("Failed to update best seller status:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update best seller status",
      }));

      // Check if the error is related to RLS
      if (
        error instanceof Error &&
        error.message.includes("row-level security")
      ) {
        setState((prev) => ({ ...prev, hasRlsError: true }));
      }

      toast({
        title: "Error",
        description: "Failed to update best seller status",
        variant: "destructive",
      });
    }
  };

  return (
    <ProductContext.Provider
      value={{
        ...state,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        setDailyOffer,
        setFeatured,
        setNewArrival,
        setBestSeller,
        refreshProducts,
        uploadProductImage,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// Custom hook to use the context
export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}
