import { cn } from "@/lib/utils";

interface SubHeadingProps {
  children: React.ReactNode;
  className?: string;
  variant?: "user" | "admin";
}

export function SubHeading({ children, className, variant = "user" }: SubHeadingProps) {
  return (
    <p
      className={cn(
        "text-sm sm:text-base max-w-2xl",
        variant === "user" ? "text-muted-foreground" : "text-slate-500 dark:text-slate-400 font-medium",
        className
      )}
    >
      {children}
    </p>
  );
}
