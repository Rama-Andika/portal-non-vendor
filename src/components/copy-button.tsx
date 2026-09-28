import { toast } from "sonner";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  successMessage?: string;
  className?: string;
  variant?: "inline" | "outline" | "ghost";
}

export function CopyButton({
  value,
  label,
  successMessage = "Copied to clipboard!",
  className,
  variant = "outline",
}: CopyButtonProps) {
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success(successMessage);
  };

  const variants = {
    inline: "p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
    outline: "flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-main dark:hover:text-main transition-all shadow-sm active:scale-95",
    ghost: "flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-500 hover:text-main transition-colors",
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(variants[variant], className)}
      type="button"
      title={label || "Copy to clipboard"}
    >
      <Copy className={cn(variant === "inline" ? "w-3.5 h-3.5" : "w-4 h-4")} />
      {label && <span>{label}</span>}
    </button>
  );
}
