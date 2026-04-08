"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { CART_KEY, FAVORITES_KEY, RECENT_PRODUCTS_KEY } from "@/lib/constants";

export type CartItem = {
  productId: string;
  title: string;
  slug: string;
  imageUrl: string;
  quantity: number;
  price: number;
  variantId?: string;
  variantLabel?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId: string | undefined) => void;
  clear: () => void;
};

type FavoriteState = {
  items: string[];
  toggle: (productId: string) => void;
};

type RecentState = {
  items: string[];
  push: (productId: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (current) =>
              current.productId === item.productId && current.variantId === item.variantId,
          );

          if (existing) {
            return {
              items: state.items.map((current) =>
                current.productId === item.productId && current.variantId === item.variantId
                  ? { ...current, quantity: current.quantity + item.quantity }
                  : current,
              ),
            };
          }

          return { items: [...state.items, item] };
        }),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId),
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: CART_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (productId) =>
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items.filter((item) => item !== productId)
            : [...state.items, productId],
        })),
    }),
    {
      name: FAVORITES_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      push: (productId) =>
        set((state) => ({
          items: [productId, ...state.items.filter((item) => item !== productId)].slice(0, 4),
        })),
    }),
    {
      name: RECENT_PRODUCTS_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
