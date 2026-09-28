import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import dayjs from "dayjs";
import { CharacterCountTextarea } from "@/components/ui/character-count-textarea";
import FieldError from "@/components/field-error";
import {
  type InvoiceFormValues,
} from "@/validation/invoice-form.validation";
import { cn } from "@/lib/utils";
import type { Department } from "@/types/department.type";
import { CopyButton } from "@/components/copy-button";

interface InvoiceBasicInfoProps {
  register: UseFormRegister<InvoiceFormValues>;
  errors: FieldErrors<InvoiceFormValues>;
  setValue: UseFormSetValue<InvoiceFormValues>;
  isReadOnly?: boolean;
  watchedRequestType?: number;
  watchedPurpose?: string;
  watchedDepartmentId?: string;
  watchedDate?: string;
  departments: Department[];
  isAdminEdit?: boolean;
  journalNo?: string;
}

export function InvoiceBasicInfo({
  register,
  errors,
  setValue: _setValue,
  isReadOnly,
  watchedPurpose,
  watchedDate,
  journalNo,
}: InvoiceBasicInfoProps) {
  const { t } = useTranslation();
  const currentTime = dayjs().format("DD/MM/YYYY HH:mm");

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-8 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-main/10 flex items-center justify-center text-main">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 uppercase tracking-tight">
          {t("invoice.basicInfoTitle")}
        </h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
              {t("columns.date")}
            </label>
            <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-mono text-sm">
              {watchedDate
                ? dayjs(watchedDate).format("DD/MM/YYYY HH:mm")
                : currentTime}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "grid grid-cols-1 gap-6",
            journalNo && "md:grid-cols-2",
          )}
        >
          {journalNo && (
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                {t("invoice.journalNo")}
              </label>
              <div className="h-12 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 font-mono font-bold text-sm select-all">
                <span>{journalNo}</span>
                <CopyButton
                  value={journalNo}
                  variant="inline"
                  successMessage={t("invoice.journalCopied")}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
              {t("columns.purpose")} <span className="text-main font-semibold">*</span>
            </label>
            {isReadOnly ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-sm leading-relaxed text-slate-900 dark:text-slate-50 font-medium min-h-[120px] whitespace-pre-wrap select-all">
                {watchedPurpose || "—"}
              </div>
            ) : (
              <CharacterCountTextarea
                {...register("purpose")}
                maxLength={150}
                currentLength={watchedPurpose?.length || 0}
                placeholder={t("invoice.purposePlaceholder")}
                className={cn(
                  "min-h-[120px] rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all resize-none text-sm leading-relaxed",
                  errors.purpose && "border-red-500 ring-red-500/10",
                )}
              />
            )}
            {errors.purpose && (
              <FieldError>{errors.purpose.message}</FieldError>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
