import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps<T extends string | number> {
  label: string;
  colorMap: Record<T, { bg: string; text: string }>;
  status: T;
  fallback?: { bg: string; text: string };
}

export function StatusBadge<T extends string | number>({ label, colorMap, status, fallback }: StatusBadgeProps<T>) {
  const colors = (colorMap as Record<string | number, { bg: string; text: string }>)[status] || fallback || { bg: "#f3f4f6", text: "#374151" };
  return (
    <Badge
      style={{ backgroundColor: colors.bg, color: colors.text }}
      className="px-2 py-0.5 uppercase text-[9px] font-bold shadow-none border-none whitespace-nowrap"
    >
      {label}
    </Badge>
  );
}
