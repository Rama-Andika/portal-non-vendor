import { create } from "zustand";
import Cookies from "js-cookie";
import type { NonVendorUser } from "@/types/non-vendor-user.type";

const basename = import.meta.env.VITE_BASENAME;
const COOKIE_KEY = "non-vendor-profile";

const getNonVendorStoredUser = (): NonVendorUser | null => {
  try {
    const cookie = Cookies.get(COOKIE_KEY);
    if (!cookie || cookie === "undefined") return null;
    return JSON.parse(cookie) as NonVendorUser;
  } catch (error) {
    return null;
  }
};

interface NonVendorAuthState {
  user: NonVendorUser | null;
  authenticated: boolean;
  signIn: (profile: NonVendorUser) => void;
  signOut: () => void;
}

export const useNonVendorAuthStore = create<NonVendorAuthState>((set) => {
  const initialUser = getNonVendorStoredUser();
  return {
    user: initialUser,
    authenticated: !!initialUser,
    signIn: (profile: NonVendorUser) => {
      Cookies.set(COOKIE_KEY, JSON.stringify(profile), { path: basename });
      set({ user: profile, authenticated: true });
    },
    signOut: () => {
      Cookies.remove(COOKIE_KEY, { path: basename });
      set({ user: null, authenticated: false });
    },
  };
});
