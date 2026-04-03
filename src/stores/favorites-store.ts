"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FavoriteItem {
  id: string;
  type: "project" | "ticket" | "hitl";
  label: string;
  href: string;
  teamColor?: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  add: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  toggle: (item: FavoriteItem) => void;
  has: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => ({ items: s.items.some((i) => i.id === item.id) ? s.items : [...s.items, item] })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggle: (item) => {
        if (get().has(item.id)) {
          set((s) => ({ items: s.items.filter((i) => i.id !== item.id) }));
        } else {
          set((s) => ({ items: [...s.items, item] }));
        }
      },
      has: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "wiring-favorites" }
  )
);
