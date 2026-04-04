"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  body?: string;
  duration?: number; // ms, default 3500
}

interface ToastState {
  items: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((s) => ({ items: [...s.items, { ...toast, id }] }));
    const dur = toast.duration ?? 3500;
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), dur);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

// 편의 헬퍼
export const toast = {
  success: (title: string, body?: string) =>
    useToastStore.getState().push({ type: "success", title, body }),
  error: (title: string, body?: string) =>
    useToastStore.getState().push({ type: "error", title, body }),
  warning: (title: string, body?: string) =>
    useToastStore.getState().push({ type: "warning", title, body }),
  info: (title: string, body?: string) =>
    useToastStore.getState().push({ type: "info", title, body }),
};
