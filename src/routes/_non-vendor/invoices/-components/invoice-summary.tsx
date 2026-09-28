import { useTranslation } from "react-i18next";
import { Calculator, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatNumberWithDecimals } from "@/utils/format-number";
import { toValidNumber } from "@/utils/to-valid-number";

interface InvoiceSummaryProps {
  subTotal: number;
  vatPercent: number;
  vatAmount: number;
  pphPercent: number;
  pphAmount: number;
  grandTotal: number;
  onVatPercentChange: (val: number) => void;
  onVatAmountChange: (val: number) => void;
  onPphPercentChange: (val: number) => void;
  onPphAmountChange: (val: number) => void;
  isReadOnly?: boolean;
  isSubmitting?: boolean;
  onStatusSubmit?: (status: "DRAFT" | "WAITING_APPROVAL") => void;
  mode?: "create" | "edit" | "view";
}

export function InvoiceSummary({
  subTotal,
  vatPercent,
  vatAmount,
  pphPercent,
  pphAmount,
  grandTotal,
  onVatPercentChange,
  onVatAmountChange,
  onPphPercentChange,
  onPphAmountChange,
  isReadOnly,
  isSubmitting,
  onStatusSubmit,
  mode,
}: InvoiceSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 p-6 md:p-10 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-main/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
        <div className="md:col-span-7 lg:col-span-8 space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-main text-white flex items-center justify-center shadow-lg shadow-main/30">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-xl text-slate-800 dark:text-slate-100">{t("invoice.summaryTitle")}</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-main transition-colors">{t("invoice.vatAdditional")}</label>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4 relative group">
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">%</div>
                   <Input 
                    type="text"
                    value={isReadOnly ? vatPercent : vatPercent === 0 ? "" : vatPercent}
                    onChange={(e) => onVatPercentChange(toValidNumber(e.target.value))}
                    disabled={isReadOnly}
                    placeholder="0"
                    className="h-14 pr-10 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white text-right font-semibold text-lg"
                  />
                </div>
                <div className="col-span-8 relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">Rp</div>
                  <Input 
                    type="text"
                    value={isReadOnly ? formatNumberWithDecimals(vatAmount) : vatAmount === 0 ? "" : formatNumberWithDecimals(vatAmount)}
                    onChange={(e) => onVatAmountChange(toValidNumber(e.target.value))}
                    onBlur={(e) => e.target.value = formatNumberWithDecimals(vatAmount)}
                    disabled={isReadOnly}
                    className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white text-right font-semibold text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-main transition-colors">{t("invoice.pphDeduction")}</label>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4 relative group">
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">%</div>
                   <Input 
                    type="text"
                    value={isReadOnly ? pphPercent : pphPercent === 0 ? "" : pphPercent}
                    onChange={(e) => onPphPercentChange(toValidNumber(e.target.value))}
                    disabled={isReadOnly}
                    placeholder="0"
                    className="h-14 pr-10 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white text-right font-semibold text-lg"
                  />
                </div>
                <div className="col-span-8 relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">Rp</div>
                  <Input 
                    type="text"
                    value={isReadOnly ? formatNumberWithDecimals(pphAmount) : pphAmount === 0 ? "" : formatNumberWithDecimals(pphAmount)}
                    onChange={(e) => onPphAmountChange(toValidNumber(e.target.value))}
                    onBlur={(e) => e.target.value = formatNumberWithDecimals(pphAmount)}
                    disabled={isReadOnly}
                    className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white text-right font-semibold text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 lg:col-span-4 space-y-4 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-8 lg:pl-10 flex flex-col justify-end pb-1">
          <div className="space-y-4 text-center md:text-right mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">{t("invoice.subAmount")}</span>
              <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                Rp {formatNumberWithDecimals(subTotal)}
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">{t("invoice.totalAmountPayable")}</span>
              <div className="flex items-center justify-center md:justify-end gap-1 flex-wrap overflow-hidden">
                <span className="text-main text-lg md:text-2xl font-bold italic mt-1 shrink-0">Rp</span>
                <div className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-none min-w-0 break-all">
                  {formatNumberWithDecimals(grandTotal)}
                </div>
              </div>
            </div>
          </div>
          
          {!isReadOnly && (
            <div className="flex flex-col gap-3">
              <Button 
                type="button"
                disabled={isSubmitting}
                onClick={() => onStatusSubmit?.("DRAFT")}
                className="w-full h-12 rounded-xl text-sm font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:shadow-md transition-all active:scale-95 group"
              >
                <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {t("common.saveAsDraft")}
              </Button>
              {mode !== "create" && (
                <Button 
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onStatusSubmit?.("WAITING_APPROVAL")}
                  className="w-full bg-main hover:bg-main/90 text-white h-14 rounded-xl text-md font-bold shadow-xl shadow-main/20 transition-all hover:-translate-y-0.5 active:scale-95 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <>
                        <Calculator className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" /> 
                        {t("invoice.submitInvoice")}
                      </>
                    )}
                  </span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
