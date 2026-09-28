import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const useCookie = <T>(
  key: string,
  initialValue: T,
  path?: { path: string }
) => {
  const [state, setState] = useState(() => {
    try {
      const cache = Cookies.get(key);
      if (cache === "undefined") return initialValue;
      return cache ? JSON.parse(cache) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (state) {
      Cookies.set(key, JSON.stringify(state), path);
    }
  }, [key, state, path]);

  return [state, setState] as const;
};

export default useCookie;
