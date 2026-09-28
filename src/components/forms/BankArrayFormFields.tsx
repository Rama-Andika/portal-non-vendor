import { useFieldArray, useWatch } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  FieldValues,
  ArrayPath,
  Path,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

interface BankArrayFormFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
}

export function BankArrayFormFields<TFieldValues extends FieldValues>({
  control,
  register,
  errors,
  setValue,
}: BankArrayFormFieldsProps<TFieldValues>) {
  const { t } = useTranslation();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "banks" as ArrayPath<TFieldValues>,
  });

  const watchedBanks = useWatch({
    control,
    name: "banks" as any,
  }) as Array<{
    beneficiaryName: string;
    bankName: string;
    accountNumber: string;
    branch: string;
    swiftCode?: string;
    isPrimary: number;
  }> | undefined;

  const handleAddBank = () => {
    if (fields.length < 2) {
      append({
        beneficiaryName: "",
        bankName: "",
        accountNumber: "",
        branch: "",
        swiftCode: "",
        isPrimary: fields.length === 0 ? 1 : 0,
      } as any);
    }
  };

  const handleSetPrimary = (indexToSet: number) => {
    fields.forEach((_, idx) => {
      setValue(`banks.${idx}.isPrimary` as Path<TFieldValues>, (idx === indexToSet ? 1 : 0) as any, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  };

  const handleRemoveBank = (index: number) => {
    const isCurrentPrimary = Number(watchedBanks?.[index]?.isPrimary) === 1;
    remove(index);
    // If the removed bank was primary and we had 2 banks, the remaining bank (now at index 0) becomes primary
    if (isCurrentPrimary && fields.length === 2) {
      setTimeout(() => {
        setValue("banks.0.isPrimary" as Path<TFieldValues>, 1 as any, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }, 0);
    }
  };

  const bankRootError = (errors as Record<string, any>).banks?.root?.message;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">
          {t("auth.bankSubtitle", "Masukkan detail rekening bank perusahaan Anda (Min 1, Maks 2)")}
        </p>
        {fields.length < 2 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBank}
            className="h-9 px-3 border-main/30 text-main hover:bg-main/5 font-semibold text-xs rounded-xl gap-1.5"
          >
            <Plus className="size-4" />
            {t("auth.addBank", "Tambah Bank")}
          </Button>
        )}
      </div>

      {bankRootError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          {bankRootError}
        </div>
      )}

      {fields.map((field, index) => {
        const isPrimary =
          Number(watchedBanks?.[index]?.isPrimary ?? (field as any).isPrimary) === 1;
        const bankErrors = (errors as Record<string, any>).banks?.[index];

        return (
          <div
            key={field.id}
            className={`p-5 rounded-2xl border transition-all relative ${
              isPrimary
                ? "bg-slate-50/80 border-main/40 ring-1 ring-main/20 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* Hidden field for isPrimary registration */}
            <input
              type="hidden"
              {...register(`banks.${index}.isPrimary` as Path<TFieldValues>, { valueAsNumber: true })}
            />

            {/* Header Bank Card */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">
                  {t("company.bank", "Bank")} #{index + 1}
                </span>

                {isPrimary ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-main bg-main/10 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="size-3.5" />
                    {t("auth.primaryBank", "Utama (Primary)")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-main bg-slate-100 hover:bg-main/10 px-2.5 py-0.5 rounded-full transition-colors"
                  >
                    <Star className="size-3" />
                    {t("auth.setAsPrimary", "Jadikan Utama")}
                  </button>
                )}
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveBank(index)}
                  className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">{t("auth.deleteBank", "Hapus Bank")}</span>
                </Button>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Beneficiary Name */}
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor={`banks.${index}.beneficiaryName`}>
                  {t("company.beneficiaryName")} <span className="text-destructive ml-0.5">*</span>
                </FieldLabel>
                <Input
                  id={`banks.${index}.beneficiaryName`}
                  placeholder={t("auth.beneficiaryNamePlaceholder", "cth. PT Example Progress")}
                  {...register(`banks.${index}.beneficiaryName` as Path<TFieldValues>)}
                />
                <FieldError>{bankErrors?.beneficiaryName?.message}</FieldError>
              </Field>

              {/* Bank Name */}
              <Field>
                <FieldLabel htmlFor={`banks.${index}.bankName`}>
                  {t("company.bankName")} <span className="text-destructive ml-0.5">*</span>
                </FieldLabel>
                <Input
                  id={`banks.${index}.bankName`}
                  placeholder={t("auth.bankNamePlaceholder", "cth. Bank Central Asia")}
                  {...register(`banks.${index}.bankName` as Path<TFieldValues>)}
                />
                <FieldError>{bankErrors?.bankName?.message}</FieldError>
              </Field>

              {/* Account Number */}
              <Field>
                <FieldLabel htmlFor={`banks.${index}.accountNumber`}>
                  {t("company.accountNo")} <span className="text-destructive ml-0.5">*</span>
                </FieldLabel>
                <Input
                  id={`banks.${index}.accountNumber`}
                  placeholder={t("auth.accountNoPlaceholder", "cth. 1234567890")}
                  {...register(`banks.${index}.accountNumber` as Path<TFieldValues>)}
                />
                <FieldError>{bankErrors?.accountNumber?.message}</FieldError>
              </Field>

              {/* Branch */}
              <Field>
                <FieldLabel htmlFor={`banks.${index}.branch`}>
                  {t("company.bankBranch")} <span className="text-destructive ml-0.5">*</span>
                </FieldLabel>
                <Input
                  id={`banks.${index}.branch`}
                  placeholder={t("auth.branchPlaceholder", "cth. KCP Sudirman")}
                  {...register(`banks.${index}.branch` as Path<TFieldValues>)}
                />
                <FieldError>{bankErrors?.branch?.message}</FieldError>
              </Field>

              {/* SWIFT Code */}
              <Field>
                <FieldLabel htmlFor={`banks.${index}.swiftCode`}>
                  {t("company.swiftCode")}{" "}
                  <span className="text-slate-400 font-normal text-xs">
                    {t("common.optional")}
                  </span>
                </FieldLabel>
                <Input
                  id={`banks.${index}.swiftCode`}
                  placeholder={t("auth.swiftCodePlaceholder", "cth. CENAIDJA")}
                  {...register(`banks.${index}.swiftCode` as Path<TFieldValues>)}
                />
                <FieldError>{bankErrors?.swiftCode?.message}</FieldError>
              </Field>
            </div>
          </div>
        );
      })}
    </div>
  );
}

