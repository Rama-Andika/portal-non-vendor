import { useEffect, useRef } from "react";

/**
 * Auto checks version.json periodically.
 * If version is updated, triggers a page reload.
 *
 * @param interval - How often to check (ms), default: 60,000 (1 minute)
 */
const baseUrl = (import.meta.env.VITE_BASENAME || "").replace(/\/$/, "");

export const useVersion = (interval: number = 30000) => {
  const currentVersion = useRef<string | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const url = `${baseUrl}/version.json?ts=${Date.now()}`;
        const res = await fetch(url); // prevent caching
        const data = await res.json();

        if (!data?.version) {
          console.warn("⚠️ version.json missing 'version' field");
          return;
        }

        if (!currentVersion.current) {
          currentVersion.current = data.version;
          console.log(`[VersionCheck] Initialized version: ${currentVersion.current}`);
        } else if (data.version !== currentVersion.current) {
          console.log(
            `🔄 New version detected (${data.version}), reloading...`
          );
          window.location.reload();
        }
      } catch (err) {
        console.warn("❌ Version check failed:", err);
      }
    };

    // Check immediately on mount
    checkVersion();

    const timer = setInterval(checkVersion, interval);
    return () => clearInterval(timer);
  }, [interval]);
};
