import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toValidNumber } from "@/utils/to-valid-number";
import { cn } from "@/lib/utils";

interface InvoiceAutoVatControlProps {
  /** 0 = mati, 1 = nyala. Angka, bukan boolean, mengikuti bentuk payload backend. */
  autoVat: number;
  /** null berarti belum diisi. Angka 0 adalah nilai yang sah. */
  autoVatPercent: number | null;
  onToggle: (checked: boolean) => void;
  onPercentChange: (value: number | null) => void;
  /**
   * true saat ada baris rincian yang sedang diedit inline. Checkbox dan input
   * dikunci, mengikuti pola tombol "Tambah Baris" yang juga dikunci saat itu.
   */
  isLocked?: boolean;
  /** true di mode view dan di halaman admin: hanya badge yang ditampilkan. */
  isReadOnly?: boolean;
  /** Pesan error dari zod untuk field autoVatPercent, ditampilkan inline. */
  errorMessage?: string;
}

/**
 * Checkbox "VAT Otomatis" beserta input persennya.
 *
 * Komponen ini menyimpan teks input persen di state lokal, bukan membaca angka
 * dari form secara langsung. Alasannya: kalau `value` diikat ke angka, user tidak
 * bisa mengetik desimal karena `Number("11.")` menghasilkan `11` sehingga titiknya
 * hilang saat render ulang.
 *
 * State lokal itu di-reset dengan cara me-remount komponen lewat `key={autoVat}`
 * di pemanggilnya, bukan lewat useEffect, supaya tidak menambah temuan lint
 * `set-state-in-effect`.
 */
export function InvoiceAutoVatControl({
  autoVat,
  autoVatPercent,
  onToggle,
  onPercentChange,
  isLocked,
  isReadOnly,
  errorMessage,
}: InvoiceAutoVatControlProps) {
  const { t } = useTranslation();
  const isActive = autoVat === 1;

  const [percentText, setPercentText] = useState(() =>
    autoVatPercent === null ? "" : String(autoVatPercent),
  );

  // Mode read-only (view non-vendor dan halaman admin): cukup badge.
  // Kalau auto VAT tidak aktif, tidak ada yang perlu ditampilkan sama sekali.
  if (isReadOnly) {
    if (!isActive) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-main/10 text-main w-fit">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-widest">
          {t("invoice.autoVat.badge", { percent: autoVatPercent ?? 0 })}
        </span>
      </div>
    );
  }

  const handlePercentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPercentText(raw);
    onPercentChange(raw.trim() === "" ? null : toValidNumber(raw));
  };

  return (
    <div
      className="flex flex-col gap-1.5"
      title={isLocked ? t("invoice.autoVat.lockedHint") : undefined}
    >
      <div className="flex items-center gap-3">
        <label
          className={cn(
            "flex items-center gap-2 select-none",
            isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
        >
          <Checkbox
            checked={isActive}
            disabled={isLocked}
            onCheckedChange={(checked) => onToggle(checked === true)}
          />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
            {t("invoice.autoVat.label")}
          </span>
        </label>

        {isActive && (
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">
              %
            </div>
            <Input
              type="text"
              inputMode="decimal"
              value={percentText}
              onChange={handlePercentInput}
              disabled={isLocked}
              placeholder={t("invoice.autoVat.percentPlaceholder")}
              aria-label={t("invoice.autoVat.percentLabel")}
              aria-invalid={!!errorMessage}
              className={cn(
                "h-10 w-24 pr-7 rounded-xl text-right font-semibold text-sm",
                errorMessage && "border-red-400 focus-visible:border-red-400",
              )}
            />
          </div>
        )}
      </div>

      {isActive && errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}

      {isActive && !errorMessage && (
        <p className="max-w-80 text-[10px] leading-relaxed text-slate-400">
          {t("invoice.autoVat.hint")}
        </p>
      )}
    </div>
  );
}
