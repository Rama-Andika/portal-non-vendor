
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type {
  Control,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import {
  User,
  Building2,
  CreditCard,
  MapPin,
  Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { EditableInfo } from "@/routes/_non-vendor/-components/editable-info";

interface BankDetailsFormFieldsProps<TFieldValues extends FieldValues> {
  variant?: "standard" | "editable";
  isEditing?: boolean;
  register?: UseFormRegister<TFieldValues>;
  control?: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  apiData?: {
    beneficiaryName?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
    branch?: string | null;
    swiftCode?: string | null;
  } | null;
}

export function BankDetailsFormFields<TFieldValues extends FieldValues>({
  variant = "standard",
  isEditing = true,
  register,
  control,
  errors,
  apiData,
}: BankDetailsFormFieldsProps<TFieldValues>) {
  const { t } = useTranslation();

  if (variant === "editable") {
    if (!control) {
      throw new Error("Control prop is required for editable variant of BankDetailsFormFields");
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="md:col-span-2">
          <Controller
            control={control}
            name={"beneficiaryName" as Path<TFieldValues>}
            render={({ field }) => (
              <EditableInfo
                label={t("company.beneficiaryName")}
                value={
                  isEditing
                    ? (field.value as string) || ""
                    : apiData?.beneficiaryName || "-"
                }
                icon={<User size={16} />}
                isEditing={isEditing}
                onChange={field.onChange}
                error={errors.beneficiaryName?.message as string}
                placeholder="e.g. PT Example Progress"
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name={"bankName" as Path<TFieldValues>}
          render={({ field }) => (
            <EditableInfo
              label={t("company.bankName")}
              value={
                isEditing
                  ? (field.value as string) || ""
                  : apiData?.bankName || "-"
              }
              icon={<Building2 size={16} />}
              isEditing={isEditing}
              onChange={field.onChange}
              error={errors.bankName?.message as string}
              placeholder="e.g. Bank Central Asia"
            />
          )}
        />

        <Controller
          control={control}
          name={"accountNumber" as Path<TFieldValues>}
          render={({ field }) => (
            <EditableInfo
              label={t("company.accountNo")}
              value={
                isEditing
                  ? (field.value as string) || ""
                  : apiData?.accountNumber || "-"
              }
              icon={<CreditCard size={16} />}
              isEditing={isEditing}
              onChange={field.onChange}
              error={errors.accountNumber?.message as string}
              placeholder="e.g. 1234567890"
            />
          )}
        />

        <Controller
          control={control}
          name={"branch" as Path<TFieldValues>}
          render={({ field }) => (
            <EditableInfo
              label={t("company.bankBranch")}
              value={
                isEditing
                  ? (field.value as string) || ""
                  : apiData?.branch || "-"
              }
              icon={<MapPin size={16} />}
              isEditing={isEditing}
              onChange={field.onChange}
              error={errors.branch?.message as string}
              placeholder="e.g. KCP Sudirman"
            />
          )}
        />

        <Controller
          control={control}
          name={"swiftCode" as Path<TFieldValues>}
          render={({ field }) => (
            <EditableInfo
              label={t("company.swiftCode")}
              value={
                isEditing
                  ? (field.value as string) || ""
                  : apiData?.swiftCode || "-"
              }
              icon={<Globe size={16} />}
              isEditing={isEditing}
              onChange={field.onChange}
              error={errors.swiftCode?.message as string}
              placeholder="e.g. CENAIDJA (Optional)"
            />
          )}
        />
      </div>
    );
  }

  if (!register) {
    throw new Error("Register prop is required for standard variant of BankDetailsFormFields");
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Beneficiary Name (Full width) */}
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="beneficiaryName">
          {t("company.beneficiaryName")} <span className="text-destructive ml-0.5">*</span>
        </FieldLabel>
        <Input
          id="beneficiaryName"
          placeholder="e.g. PT Example Progress"
          {...register("beneficiaryName" as Path<TFieldValues>)}
        />
        <FieldError>{errors.beneficiaryName?.message as string}</FieldError>
      </Field>

      {/* Bank Name */}
      <Field>
        <FieldLabel htmlFor="bankName">
          {t("company.bankName")} <span className="text-destructive ml-0.5">*</span>
        </FieldLabel>
        <Input
          id="bankName"
          placeholder="e.g. Bank Central Asia"
          {...register("bankName" as Path<TFieldValues>)}
        />
        <FieldError>{errors.bankName?.message as string}</FieldError>
      </Field>

      {/* Account Number */}
      <Field>
        <FieldLabel htmlFor="accountNumber">
          {t("company.accountNo")} <span className="text-destructive ml-0.5">*</span>
        </FieldLabel>
        <Input
          id="accountNumber"
          placeholder="e.g. 1234567890"
          {...register("accountNumber" as Path<TFieldValues>)}
        />
        <FieldError>{errors.accountNumber?.message as string}</FieldError>
      </Field>

      {/* Branch */}
      <Field>
        <FieldLabel htmlFor="branch">
          {t("company.bankBranch")} <span className="text-destructive ml-0.5">*</span>
        </FieldLabel>
        <Input
          id="branch"
          placeholder="e.g. KCP Sudirman"
          {...register("branch" as Path<TFieldValues>)}
        />
        <FieldError>{errors.branch?.message as string}</FieldError>
      </Field>

      {/* SWIFT Code */}
      <Field>
        <FieldLabel htmlFor="swiftCode">
          {t("company.swiftCode")}{" "}
          <span className="text-slate-400 font-normal text-xs">{t("common.optional")}</span>
        </FieldLabel>
        <Input
          id="swiftCode"
          placeholder="e.g. CENAIDJA"
          {...register("swiftCode" as Path<TFieldValues>)}
        />
        <FieldError>{errors.swiftCode?.message as string}</FieldError>
      </Field>
    </div>
  );
}
