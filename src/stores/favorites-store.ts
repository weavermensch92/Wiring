"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "@/stores/toast-store";

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
          toast.info("즐겨찾기 제거됨", item.label);
        } else {
          set((s) => ({ items: [...s.items, item] }));
          toast.success("즐겨찾기 추가됨", item.label);
        }
      },
      has: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "wiring-favorites" }
  )
);
