import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface LanguageOption {
  code: "id" | "en";
  label: string;
  flag?: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

interface LanguageSwitcherProps {
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = "ghost",
  size = "default",
  showLabel = true,
  className,
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const currentLangCode = (i18n.resolvedLanguage || i18n.language || "id") as "id" | "en";

  const handleLanguageChange = (code: "id" | "en") => {
    i18n.changeLanguage(code);
  };

  const activeLang = LANGUAGES.find((lang) => lang.code === currentLangCode) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 cursor-pointer ${className || ""}`}
          aria-label={t("language")}
        >
          <Globe className="size-4 text-muted-foreground" />
          {showLabel && (
            <span className="text-sm font-medium">
              {activeLang.code.toUpperCase()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {LANGUAGES.map((lang) => {
          const isActive = currentLangCode === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span className={isActive ? "font-semibold text-main" : ""}>
                  {lang.label}
                </span>
              </span>
              {isActive && <Check className="size-4 text-main ml-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
