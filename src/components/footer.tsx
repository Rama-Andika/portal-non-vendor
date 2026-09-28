import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("border-t py-4 px-6 text-center text-xs text-muted-foreground bg-white/50 backdrop-blur-sm", className)}>
      <p>© {currentYear} PT Danaco Global Solusi. All rights reserved.</p>
    </footer>
  );
}
