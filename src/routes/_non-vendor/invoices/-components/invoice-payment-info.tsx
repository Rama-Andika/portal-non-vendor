import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  Control,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import FieldError from "@/components/field-error";
import SelectReact from "@/components/ui/SelectReact";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import type { BankItem } from "@/types/bank.type";
import type { InvoiceFormValues } from "@/validation/invoice-form.validation";
import { cn } from "@/lib/utils";

interface InvoicePaymentInfoProps {
  register: UseFormRegister<InvoiceFormValues>;
  errors: FieldErrors<InvoiceFormValues>;
  control: Control<InvoiceFormValues>;
  setValue: UseFormSetValue<InvoiceFormValues>;
  isReadOnly?: boolean;
  showBankSelector?: boolean;
}

type BankSelectOption = {
  value: number;
  label: string;
  isPrimary: boolean;
  bankData: BankItem;
};

export function InvoicePaymentInfo({
  register,
  errors,
  control,
  setValue,
  isReadOnly,
  showBankSelector,
}: InvoicePaymentInfoProps) {
  const { t } = useTranslation();

  // Get the user's bank data from the store
  const { user } = useNonVendorAuthStore();
  const banks: BankItem[] = user?.banks ?? [];

  // Sort banks: primary (isPrimary === 1) goes to the top.
  // Use [...banks] so the original array in the store is NOT mutated.
  const sortedBanks: BankItem[] = [...banks].sort((a, b) => {
    const aPrimary = Number(a.isPrimary) === 1 ? 1 : 0;
    const bPrimary = Number(b.isPrimary) === 1 ? 1 : 0;
    return bPrimary - aPrimary; // 1 (primary) first, 0 (non-primary) last
  });

  // Convert the BankItem array into options for the SelectReact dropdown
  const bankOptions: BankSelectOption[] = sortedBanks.map((bank, index) => ({
    value: index,
    label: `${bank.bankName} - ${bank.accountNumber} (${bank.beneficiaryName})`,
    isPrimary: Number(bank.isPrimary) === 1,
    bankData: bank,
  }));

  // Default option for the dropdown = the first bank after sorting.
  // Since it's already sorted, index 0 is the primary bank (or the first bank
  // if none is primary). This is consistent with the auto-fill in new.tsx.
  const defaultBankOption: BankSelectOption | null = bankOptions[0] ?? null;

  // Handler for when the user selects a bank from the dropdown
  const handleBankSelect = (selectedOption: BankSelectOption | null) => {
    if (!selectedOption) return; // If the user clears the selection, do nothing

    const bank = selectedOption.bankData;

    // Fill all form fields with the selected bank's data.
    // NOTE the different field name mappings!
    setValue("beneficiaryName", bank.beneficiaryName, { shouldDirty: true });
    setValue("bankName", bank.bankName, { shouldDirty: true });
    setValue("accountNo", bank.accountNumber, { shouldDirty: true });
    setValue("bankBranch", bank.branch, { shouldDirty: true });
    setValue("swiftCode", bank.swiftCode || "", { shouldDirty: true });
  };

  const watchedBeneficiaryName = useWatch({ control, name: "beneficiaryName" }) as string;
  const watchedBankName = useWatch({ control, name: "bankName" }) as string;
  const watchedAccountNo = useWatch({ control, name: "accountNo" }) as string;
  const watchedBankBranch = useWatch({ control, name: "bankBranch" }) as string;
  const watchedSwiftCode = useWatch({ control, name: "swiftCode" }) as string;

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-8 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-main/10 flex items-center justify-center text-main">
          <Banknote className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 uppercase tracking-tight">
          {t("invoice.paymentDetails")}
        </h3>
      </div>

      {/* ── Bank Selector Dropdown (only shown in create mode) ── */}
      {showBankSelector && banks.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
            {t("invoice.selectBank")}
          </label>
          <SelectReact
            name="bankSelector"
            placeholder={t("invoice.selectBankPlaceholder")}
            options={bankOptions}
            defaultValue={defaultBankOption}
            formatOptionLabel={(option) => {
              const bankOption = option as unknown as BankSelectOption;
              return (
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="truncate">{bankOption.label}</span>
                  {bankOption.isPrimary && (
                    <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-main bg-main/10 rounded px-1.5 py-0.5">
                      {t("invoice.primaryBankLabel")}
                    </span>
                  )}
                </div>
              );
            }}
            onChange={(option) =>
              handleBankSelect(option as unknown as BankSelectOption | null)
            }
            isClearable
            className="h-12 rounded-xl bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all"
          />
          <p className="text-[10px] text-slate-400 ml-1 mt-1">
            {t("invoice.selectBankHint")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
            {t("invoice.beneficiaryName")} <span className="text-main font-semibold">*</span>
          </label>
          {isReadOnly ? (
            <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 font-medium text-sm select-all">
              {watchedBeneficiaryName || "—"}
            </div>
          ) : (
            <Input 
              {...register("beneficiaryName")} 
              disabled={isReadOnly}
              placeholder={t("invoice.accountHolderNamePlaceholder")} 
              className={cn(
                "h-12 rounded-xl bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all", 
                errors.beneficiaryName && "border-red-500 focus-visible:ring-red-500/20"
              )} 
            />
          )}
          {errors.beneficiaryName && <FieldError>{errors.beneficiaryName.message}</FieldError>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
            {t("invoice.bankName")} <span className="text-main font-semibold">*</span>
          </label>
          {isReadOnly ? (
            <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 font-medium text-sm select-all">
              {watchedBankName || "—"}
            </div>
          ) : (
            <Input 
              {...register("bankName")} 
              disabled={isReadOnly}
              placeholder={t("invoice.bankNamePlaceholder")} 
              className={cn(
                "h-12 rounded-xl bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all", 
                errors.bankName && "border-red-500 focus-visible:ring-red-500/20"
              )} 
            />
          )}
          {errors.bankName && <FieldError>{errors.bankName.message}</FieldError>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
            {t("invoice.accountNumber")} <span className="text-main font-semibold">*</span>
          </label>
          {isReadOnly ? (
            <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 font-medium text-sm select-all">
              {watchedAccountNo || "—"}
            </div>
          ) : (
            <Input 
              {...register("accountNo")} 
              disabled={isReadOnly}
              placeholder={t("invoice.accountNumberPlaceholder")} 
              className={cn(
                "h-12 rounded-xl bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all", 
                errors.accountNo && "border-red-500 focus-visible:ring-red-500/20"
              )} 
            />
          )}
          {errors.accountNo && <FieldError>{errors.accountNo.message}</FieldError>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
            {t("invoice.branch")} <span className="text-main font-semibold">*</span>
          </label>
          {isReadOnly ? (
            <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 font-medium text-sm select-all">
              {watchedBankBranch || "—"}
            </div>
          ) : (
            <Input 
              {...register("bankBranch")} 
              disabled={isReadOnly}
              placeholder={t("invoice.branchPlaceholder")} 
              className={cn(
                "h-12 rounded-xl bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all", 
                errors.bankBranch && "border-red-500 focus-visible:ring-red-500/20"
              )} 
            />
          )}
          {errors.bankBranch && <FieldError>{errors.bankBranch.message}</FieldError>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
            {t("invoice.swiftCode")} <span className="text-slate-300 font-normal lowercase">{t("common.optional")}</span>
          </label>
          {isReadOnly ? (
            <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 font-medium text-sm select-all">
              {watchedSwiftCode || "—"}
            </div>
          ) : (
            <Input 
              {...register("swiftCode")} 
              disabled={isReadOnly}
              placeholder="SWIFT/BIC" 
              className="h-12 rounded-xl bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all" 
            />
          )}
        </div>
      </div>
    </div>
  );
}
