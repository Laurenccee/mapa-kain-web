import { create } from "zustand";
import { MenuItemRecord } from "@/features/store/types/menu";
import { getMenuItemsAction } from "@/features/store/actions/menu";

interface MenuState {
  cache: Record<string, MenuItemRecord[]>;
  loadingStates: Record<string, boolean>;
  errorMessages: Record<string, string>;

  fetchMenu: (storeId: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  cache: {},
  loadingStates: {},
  errorMessages: {},

  fetchMenu: async (storeId: string) => {
    if (get().cache[storeId]) return;

    set((state) => ({
      loadingStates: { ...state.loadingStates, [storeId]: true },
      errorMessages: { ...state.errorMessages, [storeId]: "" },
    }));

    try {
      const result = await getMenuItemsAction(storeId);
      if (result.success) {
        set((state) => ({
          cache: { ...state.cache, [storeId]: result.data },
        }));
      } else {
        set((state) => ({
          errorMessages: {
            ...state.errorMessages,
            [storeId]: result.message || "Unable to load menu items.",
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        errorMessages: {
          ...state.errorMessages,
          [storeId]: "A critical network error occurred.",
        },
      }));
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, [storeId]: false },
      }));
    }
  },
}));
