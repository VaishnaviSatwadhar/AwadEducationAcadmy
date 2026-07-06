"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  coverImageUrl: string | null;
  instructorName: string;
}

interface AppState {
  theme: 'light' | 'dark' | 'system';
  cart: CartItem[];
  sidebarOpen: boolean;
  searchQuery: string;

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      cart: [],
      sidebarOpen: false,
      searchQuery: '',

      setTheme: (theme) => set({ theme }),

      addToCart: (item) => set((state) => {
        const exists = state.cart.find(i => i.id === item.id);
        if (exists) return state;
        return { cart: [...state.cart, item] };
      }),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(i => i.id !== id)
      })),

      clearCart: () => set({ cart: [] }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'awad-academy-storage',
      partialize: (state) => ({ theme: state.theme, cart: state.cart }),
    }
  )
);
