import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import type { Vendor } from "@/types/vendor.type";
import { useTranslation } from "react-i18next";

interface VendorSearchProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  results: Vendor[];
  hasSearched: boolean;
  errorMessage: string | null;
  selectedVendor: Vendor | null;
  onSelect: (vendor: Vendor) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function VendorSearch({
  keyword,
  onKeywordChange,
  onSearch,
  isSearching,
  results,
  hasSearched,
  errorMessage,
  selectedVendor,
  onSelect,
  onClear,
  disabled = false,
}: VendorSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Input + search button */}
      <div className="space-y-2">
        <Label htmlFor="vendor-code-input" className="font-medium">
          {t("admin.vendorCode")} <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="vendor-code-input"
            placeholder={t("admin.vendorCodePlaceholder")}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            disabled={disabled}
            className="flex-1 min-w-0"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onSearch}
            disabled={disabled || isSearching || !keyword.trim()}
            className="shrink-0"
          >
            {isSearching ? (
              <Loader2Icon className="size-4 mr-2 animate-spin" />
            ) : (
              <SearchIcon className="size-4 mr-2" />
            )}
            {t("common.searchBtn")}
          </Button>
        </div>
      </div>

      {/* Selected vendor */}
      {selectedVendor && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <Badge className="shrink-0">
              {selectedVendor.isPkp === 1
                ? t("admin.pkpYes")
                : t("admin.pkpNo")}
            </Badge>
            <span className="truncate font-medium">
              {selectedVendor.code} — {selectedVendor.name}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            disabled={disabled}
            className="shrink-0"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      )}

      {/* Search results (only when no vendor is selected) */}
      {!selectedVendor && hasSearched && (
        <div className="space-y-2">
          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {!errorMessage && results.length === 0 && (
            <p className="text-xs text-muted-foreground px-1">
              {t("admin.vendorNotFoundShort")}
            </p>
          )}

          {results.length > 0 && (
            <ul className="max-h-48 w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200 divide-y divide-slate-100">
              {results.map((vendor) => (
                <li
                  key={vendor.vendorId}
                  className="flex items-center justify-between gap-2 min-w-0 px-3 py-2"
                >
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <Badge variant="secondary" className="shrink-0">
                      {vendor.isPkp === 1
                        ? t("admin.pkpYes")
                        : t("admin.pkpNo")}
                    </Badge>
                    <span className="truncate text-sm font-medium">
                      {vendor.code} — {vendor.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSelect(vendor)}
                    disabled={disabled}
                    className="shrink-0"
                  >
                    {t("common.select")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
