import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangleIcon,
  Building2Icon,
  BuildingIcon,
  CheckCircle2,
  EditIcon,
  FileTextIcon,
  GlobeIcon,
  HashIcon,
  Loader2Icon,
  Mail,
  MapPinIcon,
  Phone,
  SaveIcon,
  X,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/validation/update-profile.validation";
import { useUpdateNonVendorUserMutation } from "@/queries/non-vendor.queries";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import type { AxiosError } from "axios";
import getErrorMessage from "@/utils/error-message";
import { DOCUMENT_STATUS } from "@/enums/document-status.enum";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/sub-heading";

import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { useQuery } from "@tanstack/react-query";
import { nonVendorQueries } from "@/queries/non-vendor.queries";
import {
  DOCUMENT_STATUS_COLOR,
  type DocumentStatusType,
} from "@/enums/document-status.enum";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RevisionBanner } from "./-components/revision-banner";
import { EditableInfo } from "./-components/editable-info";
import type { NonVendorUser } from "@/types/non-vendor-user.type";
import { BankArrayFormFields } from "@/components/forms/BankArrayFormFields";

export const Route = createFileRoute("/_non-vendor/company")({
  component: CompanyProfile,
});

/**
 * Maps API user data to form values.
 */
function mapApiDataToFormValues(
  apiData: NonVendorUser,
): UpdateProfileFormValues {
  return {
    email: apiData.email || "",
    companyName: apiData.companyName || "",
    companyType:
      (apiData.companyType as UpdateProfileFormValues["companyType"]) || "PT",
    otherCompanyType: apiData.otherCompanyType || "",
    address: apiData.address || "",
    province: apiData.province || "",
    city: apiData.city || "",
    postalCode: apiData.postalCode || "",
    phoneNumber: apiData.phoneNumber || "",
    website: apiData.website || "",
    banks:
      apiData.banks && apiData.banks.length > 0
        ? apiData.banks.map((b) => ({
            beneficiaryName: b.beneficiaryName || "",
            bankName: b.bankName || "",
            accountNumber: b.accountNumber || "",
            branch: b.branch || "",
            swiftCode: b.swiftCode || "",
            isPrimary: Number(b.isPrimary) === 1 ? 1 : 0,
          }))
        : [
            {
              beneficiaryName: "",
              bankName: "",
              accountNumber: "",
              branch: "",
              swiftCode: "",
              isPrimary: 1,
            },
          ],
  };
}

function CompanyProfile() {
  const { t } = useTranslation();
  const { user } = useNonVendorAuthStore();

  // Fetch data from API using useQuery
  const {
    data: userResponse,
    isLoading,
    isError,
    error,
  } = useQuery(nonVendorQueries.user(user?.id ?? ""));

  const apiData = userResponse?.data;

  // Mutation for updating data
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateNonVendorUserMutation(user?.id ?? "");

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tempData, setTempData] = useState<UpdateProfileFormValues | null>(
    null,
  );

  // Check if user is allowed to edit (only if status is REVISION)
  const canEdit = apiData?.status === DOCUMENT_STATUS.REVISION;

  // Setup React Hook Form with Zod resolver
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: apiData ? mapApiDataToFormValues(apiData) : undefined,
  });

  // Sync form values when API data is successfully fetched
  React.useEffect(() => {
    if (apiData) {
      reset(mapApiDataToFormValues(apiData));
    }
  }, [apiData, reset]);

  const handleEdit = () => {
    if (apiData) {
      reset(mapApiDataToFormValues(apiData));
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (apiData) {
      reset(mapApiDataToFormValues(apiData));
    }
    setIsEditing(false);
  };

  const onSubmit = (data: UpdateProfileFormValues) => {
    if (!user?.id) return;

    updateProfile(data, {
      onSuccess: () => {
        toast(<ToastSuccess message={t("company.updateSuccess")} />);
        setIsEditing(false);
        setShowConfirmDialog(false);
        setTempData(null);
      },
      onError: (err) => {
        const message = getErrorMessage(err as AxiosError);
        toast(<ToastError message={message || t("company.updateError")} />);
        setShowConfirmDialog(false);
      },
    });
  };

  const onPreSubmit = (data: UpdateProfileFormValues) => {
    setTempData(data);
    setShowConfirmDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <Loader2Icon className="animate-spin text-main" size={32} />
        <p className="text-sm">{t("company.loadingData")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertTriangleIcon size={32} />
        <p className="text-sm font-medium">{t("company.failedLoadData")}</p>
        <p className="text-xs text-muted-foreground">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden animate-in fade-in duration-500">
      {/* Page Header with Stable Height */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 min-h-20">
        <div className="flex flex-col gap-2">
          <Heading>{t("company.title")}</Heading>
          <SubHeading>{t("company.subtitle")}</SubHeading>
        </div>

        <div className="flex items-center h-10 w-full md:w-auto">
          {!isEditing && (
            <div className="flex flex-col items-end gap-1 w-full md:w-auto">
              <Button
                onClick={handleEdit}
                disabled={!canEdit}
                title={
                  !canEdit ? t("company.editRevisionOnlyTooltip") : undefined
                }
                className="w-full md:w-auto bg-main hover:bg-main/90 text-white gap-2 shadow-lg shadow-main/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <EditIcon size={16} />
                {t("company.editProfile")}
              </Button>
              {!canEdit && (
                <p className="text-[10px] text-muted-foreground font-medium">
                  {t("company.statusRevisionRequired")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {apiData?.status === DOCUMENT_STATUS.REVISION &&
        apiData?.revisionReason && (
          <RevisionBanner reason={apiData.revisionReason} />
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Header Card */}
        <Card className="lg:col-span-3 border-none shadow-xl shadow-main/5 bg-linear-to-br from-card to-main/5 overflow-hidden transition-all duration-300">
          <CardHeader className="relative pb-8 md:pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
              <div className="flex items-start md:items-center gap-4 md:gap-5 w-full">
                <div className="flex size-14 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-main text-white shadow-lg shadow-main/20 mt-1 md:mt-0">
                  <Building2Icon
                    size={28}
                    className="md:size-9"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="space-y-2 md:space-y-1 flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    {isEditing ? (
                      <div className="w-full flex flex-col gap-1">
                        <Input
                          {...register("companyName")}
                          className="text-xl md:text-3xl font-bold h-auto py-2 md:py-0 border-main/20 bg-main/5 md:border-none md:bg-transparent focus-visible:ring-1 md:focus-visible:ring-0 px-2 md:px-0 w-full shadow-none"
                          placeholder={t("company.companyNamePlaceholder")}
                        />
                        {errors.companyName && (
                          <p className="text-xs text-destructive font-medium px-2 md:px-0">
                            {errors.companyName.message}
                          </p>
                        )}
                        <span className="text-[10px] text-main font-semibold md:hidden uppercase tracking-tighter">
                          {t("company.editNameAbove")}
                        </span>
                      </div>
                    ) : (
                      <CardTitle className="text-xl sm:text-3xl font-extrabold wrap-break-word whitespace-normal leading-tight text-slate-900 dark:text-slate-100">
                        {apiData?.companyName || user?.companyName}
                      </CardTitle>
                    )}
                    <Badge
                      variant="outline"
                      className="w-fit border-main/30 text-main bg-main/5 font-medium px-3"
                    >
                      {apiData?.companyType || user?.companyType}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="w-fit font-semibold px-3 border-none shadow-sm"
                      style={{
                        backgroundColor:
                          DOCUMENT_STATUS_COLOR[
                            (apiData?.status ||
                              user?.status) as DocumentStatusType
                          ]?.bg || "#f1f5f9",
                        color:
                          DOCUMENT_STATUS_COLOR[
                            (apiData?.status ||
                              user?.status) as DocumentStatusType
                          ]?.text || "#64748b",
                      }}
                    >
                      {apiData?.status || user?.status || "UNKNOWN"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs md:text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon size={14} className="text-main" />
                      <span>
                        {apiData?.city || user?.city},{" "}
                        {apiData?.province || user?.province}
                      </span>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="h-3 hidden md:block"
                    />
                    <div className="flex items-center gap-1.5">
                      <GlobeIcon size={14} className="text-main" />
                      <a
                        href={apiData?.website || user?.website || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-main hover:underline transition-colors"
                      >
                        {(apiData?.website || user?.website || "").replace(
                          /^https?:\/\//,
                          "",
                        )}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Legal Info Section */}
        <Card className="lg:col-span-1 border-none shadow-lg h-full transition-all">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-main">
              <FileTextIcon size={20} />
              <CardTitle className="text-lg font-semibold">
                {t("company.legalInfo")}
              </CardTitle>
            </div>
            <CardDescription>{t("company.legalSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-3">
            <div className="space-y-2">
              <Controller
                control={control}
                name="companyType"
                render={({ field }) => (
                  <EditableInfo
                    label={t("company.companyType")}
                    value={
                      isEditing
                        ? field.value || ""
                        : apiData?.companyType || user?.companyType || ""
                    }
                    icon={<BuildingIcon size={16} />}
                    isEditing={isEditing}
                    type="select"
                    options={[
                      { label: "PT", value: "PT" },
                      { label: "CV", value: "CV" },
                      { label: "UD", value: "UD" },
                      { label: "Individual", value: "Individual" },
                      { label: "Others", value: "Others" },
                    ]}
                    onChange={field.onChange}
                    error={errors.companyType?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <EditableInfo
                    label={t("company.emailAddress")}
                    value={
                      isEditing
                        ? field.value || ""
                        : apiData?.email || user?.email || ""
                    }
                    icon={<Mail size={16} />}
                    isEditing={isEditing}
                    onChange={field.onChange}
                    error={errors.email?.message}
                  />
                )}
              />
              {isEditing && watch("companyType") === "Others" && (
                <div className="px-3 pb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Input
                    placeholder={t("company.specifyOtherType")}
                    {...register("otherCompanyType")}
                    className="h-8 text-xs border-main/20 focus-visible:ring-main/30"
                  />
                  {errors.otherCompanyType && (
                    <p className="text-[10px] text-destructive mt-1 px-1">
                      {errors.otherCompanyType.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Info Section */}
        <Card className="lg:col-span-2 border-none shadow-lg h-full transition-all">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-main">
              <MapPinIcon size={20} />
              <CardTitle className="text-lg font-semibold">
                {t("company.addressInfo")}
              </CardTitle>
            </div>
            <CardDescription>{t("company.addressSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <EditableInfo
                      label={t("company.registeredAddress")}
                      value={
                        isEditing
                          ? field.value || ""
                          : apiData?.address || user?.address || ""
                      }
                      icon={<MapPinIcon size={16} />}
                      isEditing={isEditing}
                      onChange={field.onChange}
                      error={errors.address?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="postalCode"
                  render={({ field }) => (
                    <EditableInfo
                      label={t("company.postalCode")}
                      value={
                        isEditing
                          ? field.value || ""
                          : apiData?.postalCode || user?.postalCode || ""
                      }
                      icon={<HashIcon size={16} />}
                      isEditing={isEditing}
                      onChange={field.onChange}
                      error={errors.postalCode?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <EditableInfo
                      label={t("company.phoneNumber")}
                      value={
                        isEditing
                          ? field.value || ""
                          : apiData?.phoneNumber || user?.phoneNumber || ""
                      }
                      icon={<Phone size={16} />}
                      isEditing={isEditing}
                      onChange={field.onChange}
                      error={errors.phoneNumber?.message}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="province"
                  render={({ field }) => (
                    <EditableInfo
                      label={t("company.province")}
                      value={
                        isEditing
                          ? field.value || ""
                          : apiData?.province || user?.province || ""
                      }
                      icon={<MapPinIcon size={16} />}
                      isEditing={isEditing}
                      onChange={field.onChange}
                      error={errors.province?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <EditableInfo
                      label={t("company.city")}
                      value={
                        isEditing
                          ? field.value || ""
                          : apiData?.city || user?.city || ""
                      }
                      icon={<BuildingIcon size={16} />}
                      isEditing={isEditing}
                      onChange={field.onChange}
                      error={errors.city?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="website"
                  render={({ field }) => (
                    <EditableInfo
                      label={t("company.website")}
                      value={
                        isEditing
                          ? field.value || ""
                          : apiData?.website || user?.website || ""
                      }
                      icon={<GlobeIcon size={16} />}
                      isEditing={isEditing}
                      onChange={field.onChange}
                      error={errors.website?.message}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Info Section */}
        <Card className="lg:col-span-3 border-none shadow-lg h-full transition-all">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-main">
              <Building2Icon size={20} />
              <CardTitle className="text-lg font-semibold">
                {t("company.bankInfo")}
              </CardTitle>
            </div>
            <CardDescription>{t("company.bankSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isEditing ? (
              <BankArrayFormFields
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {apiData?.banks && apiData.banks.length > 0 ? (
                  apiData.banks.map((bank, index) => {
                    const isPrimary = Number(bank.isPrimary) === 1;
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border relative transition-all ${
                          isPrimary
                            ? "bg-slate-50/80 border-main/40 ring-1 ring-main/20 shadow-sm"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-700">
                            {t("company.bank", "Bank")} #{index + 1}
                          </span>
                          {isPrimary && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-main bg-main/10 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="size-3.5" />
                              {t("auth.primaryBank", "Utama (Primary)")}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-slate-400 font-medium">
                              {t("company.beneficiaryName")}:
                            </span>{" "}
                            <span className="font-semibold text-slate-700">
                              {bank.beneficiaryName || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">
                              {t("company.bankName")}:
                            </span>{" "}
                            <span className="font-semibold text-slate-700">
                              {bank.bankName || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">
                              {t("company.accountNo")}:
                            </span>{" "}
                            <span className="font-semibold text-slate-700">
                              {bank.accountNumber || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">
                              {t("company.bankBranch")}:
                            </span>{" "}
                            <span className="font-semibold text-slate-700">
                              {bank.branch || "-"}
                            </span>
                          </div>
                          {bank.swiftCode && (
                            <div>
                              <span className="text-slate-400 font-medium">
                                {t("company.swiftCode")}:
                              </span>{" "}
                              <span className="font-semibold text-slate-700">
                                {bank.swiftCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic font-medium p-2">
                    {t("company.noBankDetails", "Belum ada detail bank.")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Actions - Bottom */}
      {isEditing && (
        <div className="flex items-center justify-end gap-3 pt-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
            className="w-full md:w-32 h-11 gap-2 border-main/20 hover:bg-main/5"
          >
            <X size={18} />
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit(onPreSubmit)}
            disabled={isUpdating}
            className="w-full md:w-48 h-11 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            {isUpdating ? (
              <Loader2Icon size={18} className="animate-spin" />
            ) : (
              <SaveIcon size={18} />
            )}
            {isUpdating ? t("company.saving") : t("company.saveChanges")}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={() => tempData && onSubmit(tempData)}
        title={t("company.confirmSaveTitle")}
        confirmText={t("company.confirmSaveBtn")}
        isLoading={isUpdating}
        description={
          <div className="space-y-3 font-medium">
            <p>{t("company.confirmSaveDesc1")}</p>
            <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg border border-border/50 font-normal">
              {t("company.confirmSaveDesc2")}
            </p>
          </div>
        }
      />
    </div>
  );
}
