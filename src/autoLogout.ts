import { useEffect, useCallback, useRef } from "react";
import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";

const basename = import.meta.env.VITE_BASENAME;
const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes

const AutoLogout = () => {
  const { authenticated: isAdminAuthenticated, signOut: adminSignOut } = useAdminAuthStore();
  const { authenticated: isNonVendorAuthenticated, signOut: nonVendorSignOut } = useNonVendorAuthStore();
  
  const logoutTimerRef = useRef<number | null>(null);

  const logoutUser = useCallback(() => {
    const isCurrentlyOnAdminPage = window.location.pathname.includes("/admin");

    if (isCurrentlyOnAdminPage && isAdminAuthenticated) {
      adminSignOut();
      window.location.href = `${basename || ""}/admin-login`;
    } else if (!isCurrentlyOnAdminPage && isNonVendorAuthenticated) {
      nonVendorSignOut();
      window.location.href = `${basename || ""}/login`;
    } else {
      if (isAdminAuthenticated) {
        adminSignOut();
        window.location.href = `${basename || ""}/admin-login`;
      } else if (isNonVendorAuthenticated) {
        nonVendorSignOut();
        window.location.href = `${basename || ""}/login`;
      }
    }
  }, [isAdminAuthenticated, adminSignOut, isNonVendorAuthenticated, nonVendorSignOut]);


  const resetTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    // Only set timer if someone is logged in
    if (isAdminAuthenticated || isNonVendorAuthenticated) {
      logoutTimerRef.current = window.setTimeout(logoutUser, AUTO_LOGOUT_TIME);
    }
  }, [logoutUser, isAdminAuthenticated, isNonVendorAuthenticated]);

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "touchstart",
      "scroll",
    ];

    const handleInteraction = () => {
      resetTimer();
    };

    events.forEach((event) =>
      window.addEventListener(event, handleInteraction, { passive: true })
    );

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleInteraction));
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [resetTimer]);

  return null;
};

export default AutoLogout;
