import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  nonVendorQueries,
  useUploadNonVendorRequestFileMutation,
  useSettleNonVendorRequestMutation,
} from "@/queries/non-vendor.queries";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import { PageHeader } from "@/components/page-header";
import { queryClient } from "@/queries/queryClient";
import { InvoiceStatus } from "@/types/invoice.type";
import { SettleStatus, PaymentType, paymentTypeOptions } from "@/types/settlement.type";
import { formatCurrency } from "@/utils/format-currency";
import {
  Loader2,
  CheckCircle2,
  UploadCloud,
  FileText,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settlementSchema,
  type SettlementFormValues,
} from "@/validation/settlement.validation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_non-vendor/settlements/$id/process")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(nonVendorQueries.requestDetail(params.id)),
  component: SettleProcessPage,
  staticData: {
    breadcrumb: "breadcrumb.processSettlement",
  },
});

function SettleProcessPage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user: authUser } = useNonVendorAuthStore();

  const { data: response, isLoading } = useQuery(
    nonVendorQueries.requestDetail(id),
  );
  const requestData = response?.data;

  const { mutateAsync: uploadFile } = useUploadNonVendorRequestFileMutation();
  const { mutateAsync: settleRequest, isPending: isSettling } =
    useSettleNonVendorRequestMutation(id);

  const [files, setFiles] = useState<{
    settlement_doc_path: File | null;
    settlement_transfer_doc_path: File | null;
    settlement_doc_path2: File | null;
  }>({
    settlement_doc_path: null,
    settlement_transfer_doc_path: null,
    settlement_doc_path2: null,
  });

  const [uploadStatus, setUploadStatus] = useState<
    Record<string, "idle" | "uploading" | "success" | "error">
  >({
    settlement_doc_path: "idle",
    settlement_transfer_doc_path: "idle",
    settlement_doc_path2: "idle",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettlementFormValues>({
    resolver: zodResolver(settlementSchema),
    values: {
      settleAmount: requestData?.totalAmount || 0,
      settleNote: "",
      settlePaymentType: PaymentType.CASH, // Default to Cash
    },
  });

  const settlePaymentType = watch("settlePaymentType");

  const canSettle = useMemo(() => {
    if (!requestData) return false;
    return (
      requestData.status === InvoiceStatus.CHECKED &&
      requestData.settleStatus === SettleStatus.UNSETTLE &&
      !!requestData.refId &&
      ![0, 3].includes(requestData.requestType)
    );
  }, [requestData]);

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse text-slate-500">
        {t("settlement.loadingDetails")}
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t("settlement.dataNotFound")}
      </div>
    );
  }

  if (!canSettle) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/settlements" })}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PageHeader
            title={t("settlement.notAvailable")}
            subtitle={t("settlement.notAvailableSubtitle")}
          />
        </div>
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="pt-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
            <div className="space-y-2">
              <p className="font-bold text-amber-900 dark:text-amber-200 text-lg">
                {t("settlement.cannotBeProcessed")}
              </p>
              <ul className="list-disc list-inside text-amber-800 dark:text-amber-300 space-y-1 text-sm">
                <li>
                  {t("settlement.criteriaStatus")}
                </li>
                <li>
                  {t("settlement.criteriaSettleStatus")}
                </li>
                <li>
                  {t("settlement.criteriaRefId")}
                </li>
              </ul>
              <Button
                variant="outline"
                className="mt-4 border-amber-200 text-amber-900 hover:bg-amber-100"
                onClick={() => navigate({ to: "/settlements" })}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("settlement.backToSettlements")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileChange = (type: keyof typeof files, file: File | null) => {
    if (file && file.type !== "application/pdf") {
      toast.error(t("settlement.onlyPdfAllowed"));
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error(t("settlement.maxSize2mb"));
      return;
    }
    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const onSubmit = async (data: SettlementFormValues) => {
    if (!files.settlement_doc_path || !files.settlement_transfer_doc_path) {
      toast.error(
        t("settlement.uploadRequiredDocs"),
      );
      return;
    }

    try {
      // 1. Upload Files
      const uploadTasks = [
        { type: "settlement_doc_path", file: files.settlement_doc_path },
        {
          type: "settlement_transfer_doc_path",
          file: files.settlement_transfer_doc_path,
        },
      ];
      if (files.settlement_doc_path2) {
        uploadTasks.push({
          type: "settlement_doc_path2",
          file: files.settlement_doc_path2,
        });
      }

      for (const task of uploadTasks) {
        setUploadStatus((prev) => ({ ...prev, [task.type]: "uploading" }));
        try {
          await uploadFile({ id, type: task.type, file: task.file });
          setUploadStatus((prev) => ({ ...prev, [task.type]: "success" }));
        } catch (error) {
          setUploadStatus((prev) => ({ ...prev, [task.type]: "error" }));
          throw new Error(`Failed to upload ${task.type.replace(/_/g, " ")}`);
        }
      }

      // 2. Submit Settlement
      await settleRequest({
        portalNonVendorUserId: authUser?.id || "",
        settleAmount: data.settleAmount,
        settleNote: data.settleNote,
        settlePaymentType: data.settlePaymentType,
      });

      toast(<ToastSuccess message={t("settlement.submitSuccess")} />);
      navigate({ to: "/settlements" });
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || t("settlement.submitError");
      toast(
        <ToastError
          message={errorMsg}
        />,
      );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/settlements" })}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title={t("settlement.processTitle")}
          subtitle={`Invoice #${requestData.number}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg font-bold uppercase tracking-tight">
                {t("settlement.uploadDocsTitle")}
              </CardTitle>
              <CardDescription>
                {t("settlement.uploadDocsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <FileDropzone
                label={t("settlement.mainDocRequired")}
                file={files.settlement_doc_path}
                status={uploadStatus.settlement_doc_path}
                onSelect={(f) => handleFileChange("settlement_doc_path", f)}
              />
              <FileDropzone
                label={t("settlement.transferProofRequired")}
                file={files.settlement_transfer_doc_path}
                status={uploadStatus.settlement_transfer_doc_path}
                onSelect={(f) =>
                  handleFileChange("settlement_transfer_doc_path", f)
                }
              />
              <FileDropzone
                label={t("settlement.additionalDocOptional")}
                file={files.settlement_doc_path2}
                status={uploadStatus.settlement_doc_path2}
                onSelect={(f) => handleFileChange("settlement_doc_path2", f)}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg font-bold uppercase tracking-tight">
                {t("settlement.infoTitle")}
              </CardTitle>
              <CardDescription>
                {t("settlement.infoDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                id="settle-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="settleAmount"
                      className="text-xs font-bold uppercase text-slate-500"
                    >
                      {t("settlement.settleAmount")}
                    </Label>
                    <Input
                      id="settleAmount"
                      type="number"
                      {...register("settleAmount", { valueAsNumber: true })}
                      className={cn(
                        "h-11 rounded-xl",
                        errors.settleAmount && "border-destructive",
                      )}
                    />
                    {errors.settleAmount && (
                      <p className="text-xs text-destructive font-medium">
                        {errors.settleAmount.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="settlePaymentType"
                      className="text-xs font-bold uppercase text-slate-500"
                    >
                      {t("settlement.paymentTypeLabel")}
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setValue("settlePaymentType", parseInt(val))
                      }
                      value={settlePaymentType?.toString()}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-11 rounded-xl",
                          errors.settlePaymentType && "border-destructive",
                        )}
                      >
                        <SelectValue placeholder={t("settlement.selectPaymentType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.settlePaymentType && (
                      <p className="text-xs text-destructive font-medium">
                        {errors.settlePaymentType.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="settleNote"
                    className="text-xs font-bold uppercase text-slate-500"
                  >
                    {t("settlement.notesRemarks")}
                  </Label>
                  <Textarea
                    id="settleNote"
                    {...register("settleNote")}
                    className={cn(
                      "min-h-[120px] rounded-xl",
                      errors.settleNote && "border-destructive",
                    )}
                    placeholder={t("settlement.notesPlaceholder")}
                  />
                  {errors.settleNote && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.settleNote.message}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 shadow-none rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("settlement.requestSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500">{t("columns.totalInvoice")}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(requestData.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500">{t("columns.purpose")}</span>
                <span className="text-xs font-medium text-right max-w-[150px] text-slate-700 dark:text-slate-300 line-clamp-2">
                  {requestData.purpose}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500">Ref ID</span>
                <span className="text-xs font-mono font-bold text-main">
                  {requestData.refId}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            form="settle-form"
            type="submit"
            disabled={
              isSettling ||
              !files.settlement_doc_path ||
              !files.settlement_transfer_doc_path
            }
            className="w-full h-14 rounded-2xl bg-main hover:bg-main/90 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-main/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("settlement.processing")}
              </>
            ) : (
              <>{t("settlement.submitSettlement")}</>
            )}
          </Button>

          <p className="text-[10px] text-center text-slate-400 font-medium px-4">
            {t("settlement.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}

function FileDropzone({
  label,
  file,
  status,
  onSelect,
}: {
  label: string;
  file: File | null;
  status: "idle" | "uploading" | "success" | "error";
  onSelect: (file: File) => void;
}) {
  const { t } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
        {label}
      </Label>
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        ref={inputRef}
        onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
      />

      {file ? (
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
            status === "success"
              ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/50"
              : "bg-slate-50/80 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700",
          )}
        >
          <div className="flex items-center gap-3 truncate">
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                status === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-main/10 text-main",
              )}
            >
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
              {file.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {status === "uploading" && (
              <Loader2 className="w-4 h-4 animate-spin text-main" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            {status === "error" && (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            {status === "idle" && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-[10px] font-black uppercase text-main hover:text-main/80 tracking-wider"
              >
                {t("settlement.changeFile")}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-main/5 border-slate-200 dark:border-slate-800 hover:border-main dark:hover:border-main transition-all group duration-300"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-main/10 group-hover:text-main transition-all">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 group-hover:text-main uppercase tracking-widest">
              {t("settlement.selectPdf")}
            </p>
            <p className="text-[9px] text-slate-400 font-medium">{t("settlement.max2mb")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

