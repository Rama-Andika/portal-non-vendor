import { cn } from "@/lib/utils";

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  variant?: "user" | "admin";
}

export function Heading({ children, className, variant = "user" }: HeadingProps) {
  return (
    <h1
      className={cn(
        "text-3xl font-extrabold tracking-tight sm:text-4xl",
        variant === "user" ? "text-main" : "text-slate-900 dark:text-slate-100",
        className
      )}
    >
      {children}
    </h1>
  );
}
