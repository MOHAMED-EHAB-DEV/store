import { create } from "zustand";
import { ITemplate, IUser } from "@/types";

interface UserState {
  user: IUser | null;
  favoriteTemplates: ITemplate[];
  purchasedTemplates: string[];
  reloadTrigger: number;
  setUser: (user: IUser | null) => void;
  setFavoriteTemplates: (templates: ITemplate[]) => void;
  setPurchasedTemplates: (templates: string[]) => void;
  triggerReload: () => void;
  addToFavoritesLocal: (template: ITemplate) => void;
  removeFromFavoritesLocal: (template: ITemplate) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  favoriteTemplates: [],
  purchasedTemplates: [],
  reloadTrigger: 0,
  setUser: (user) => set({ user }),
  setFavoriteTemplates: (favoriteTemplates) => set({ favoriteTemplates }),
  setPurchasedTemplates: (purchasedTemplates) => set({ purchasedTemplates }),
  triggerReload: () => set((state) => ({ reloadTrigger: state.reloadTrigger + 1 })),
  addToFavoritesLocal: (template: ITemplate) => set((state) => ({ favoriteTemplates: [...state.favoriteTemplates, template] })),
  removeFromFavoritesLocal: (template: ITemplate) => set((state) => ({ favoriteTemplates: state.favoriteTemplates.filter(t => t._id !== template._id) })),
}));
