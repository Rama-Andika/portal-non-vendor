import type { UseFormRegister, FieldErrors, Control } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import FieldError from "@/components/field-error";
import type { InvoiceFormValues } from "@/validation/invoice-form.validation";
import { cn } from "@/lib/utils";

interface InvoicePaymentInfoProps {
  register: UseFormRegister<InvoiceFormValues>;
  errors: FieldErrors<InvoiceFormValues>;
  control: Control<InvoiceFormValues>;
  isReadOnly?: boolean;
}

export function InvoicePaymentInfo({ register, errors, control, isReadOnly }: InvoicePaymentInfoProps) {
  const { t } = useTranslation();
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
