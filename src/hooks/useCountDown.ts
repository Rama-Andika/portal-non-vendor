import { useEffect, useState } from "react";

export function useCountdown(endTime: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffSeconds = Math.floor(
    (new Date(endTime).getTime() - now) / 1000
  );

  const absSeconds = Math.abs(diffSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;

  const sign = diffSeconds < 0 ? "-" : "";

  return {
    secondsLeft: diffSeconds, // bisa negatif
    isOverdue: diffSeconds < 0,
    timeLabel: `${sign}${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`,
  };
}
