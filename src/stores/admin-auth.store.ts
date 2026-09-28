import { create } from "zustand";
import Cookies from "js-cookie";
import type { AdminUser } from "@/types/admin-user.type";

const basename = import.meta.env.VITE_BASENAME;
const PROFILE_COOKIE_KEY = "admin-profile";
const TOKEN_COOKIE_KEY = "admin-token";

const getAdminStoredUser = (): AdminUser | null => {
  try {
    const cookie = Cookies.get(PROFILE_COOKIE_KEY);
    if (!cookie || cookie === "undefined") return null;
    return JSON.parse(cookie) as AdminUser;
  } catch (error) {
    return null;
  }
};

interface AdminAuthState {
  user: AdminUser | null;
  authenticated: boolean;
  signIn: (profile: AdminUser) => void;
  signOut: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => {
  const initialUser = getAdminStoredUser();
  return {
    user: initialUser,
    authenticated: !!initialUser,
    signIn: (profile: AdminUser) => {
      Cookies.set(PROFILE_COOKIE_KEY, JSON.stringify(profile), { path: basename });
      Cookies.set(
        TOKEN_COOKIE_KEY,
        JSON.stringify({ token: profile.token, refreshToken: profile.refreshToken }),
        { path: basename }
      );
      set({ user: profile, authenticated: true });
    },
    signOut: () => {
      Cookies.remove(PROFILE_COOKIE_KEY, { path: basename });
      Cookies.remove(TOKEN_COOKIE_KEY, { path: basename });
      set({ user: null, authenticated: false });
    },
  };
});
