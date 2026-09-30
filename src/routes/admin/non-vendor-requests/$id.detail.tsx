import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { nonVendorQueries, nonVendorKeys } from "@/queries/non-vendor.queries";
import { InvoiceForm } from "@/routes/_non-vendor/invoices/-components/invoice-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, AlertCircle, Save, Loader2 } from "lucide-react";
import { queryClient } from "@/queries/queryClient";
import { SettlementDetailCard } from "@/components/settlement/settlement-detail-card";
import {
  getNonVendorRequestFilePreview,
  updatePortalRequest,
} from "@/api/non-vendor.api";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import {
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_COLOR,
} from "@/enums/document-status.enum";
import { UpdateStatusDialog } from "./-components/update-status-dialog";
import type { PortalRequestStatus } from "@/types/portal-request.type";
import { Alert, AlertDescription } from "@/components/ui/alert";
import getErrorMessage from "@/utils/error-message";
import { cn } from "@/lib/utils";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/admin/non-vendor-requests/$id/detail")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(
      nonVendorQueries.portalRequestDetail(params.id),
    ),
  component: AdminRequestDetailPage,
  staticData: {
    breadcrumb: "breadcrumb.requestDetail",
  },
});

function AdminRequestDetailPage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] =
    React.useState<boolean>(false);
  const [isSavingData, setIsSavingData] = React.useState<boolean>(false);

  // 1. Fetch data for this specific request
  const { data: response, isLoading } = useQuery(
    nonVendorQueries.portalRequestDetail(id),
  );
  const requestData = response?.data;

  const [adminFields, setAdminFields] = React.useState<{
    departmentId: string | null;
    requestType: number;
  }>({
    departmentId: null,
    requestType: 0,
  });

  React.useEffect(() => {
    if (requestData) {
      setAdminFields({
        departmentId: requestData.departmentId ?? null,
        requestType: requestData.requestType ?? 0,
      });
    }
  }, [requestData]);

  const handleSaveData = async () => {
    try {
      setIsSavingData(true);
      toast.loading(t("company.saving"), { id: "save-loading" });

      if (!requestData) {
        throw new Error("Failed to retrieve current request details.");
      }

      await updatePortalRequest(id, {
        departmentId: adminFields.departmentId,
        requestType: String(adminFields.requestType),
        paymentType: String(requestData.paymentType),
        bankName: requestData.bankName,
        beneficiaryName: requestData.beneficiaryName,
        accountNo: requestData.accountNo,
        bankBranch: requestData.bankBranch,
        swiftCode: requestData.swiftCode || undefined,
        purpose: requestData.purpose,
        status: requestData.status as PortalRequestStatus,
        vatAmount: requestData.vatAmount,
        vatPercent: requestData.vatPercent,
        pphAmount: requestData.pphAmount,
        pphPercent: requestData.pphPercent,
        portalNonVendorUserId: requestData.portalNonVendorUserId,
        details: requestData.details.map((d) => ({
          id: String(d.id || ""),
          description: d.description,
          invoiceNumber: d.invoiceNumber || "",
          qty: d.qty || 1,
          currencyId: d.currencyId,
          price: d.price,
          rate: d.rate,
          vatPercent: d.vatPercent || 0,
          vatAmount: d.vatAmount || 0,
          pphPercent: d.pphPercent || 0,
          pphAmount: d.pphAmount || 0,
          pphType: d.pphType,
        })),
      });

      // Invalidate queries to refresh detail data
      await queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.all,
      });

      toast.dismiss("save-loading");
      toast(<ToastSuccess message={t("invoice.updateSuccess")} />);
    } catch (error: unknown) {
      toast.dismiss("save-loading");
      toast(<ToastError message={getErrorMessage(error as AxiosError)} />);
    } finally {
      setIsSavingData(false);
    }
  };

  const handlePreview = async (filename: string) => {
    try {
      toast.loading(t("admin.loadingDocumentPreview"), { id: "preview-loading" });
      const blob = await getNonVendorRequestFilePreview(filename);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.dismiss("preview-loading");
    } catch {
      toast.dismiss("preview-loading");
      toast(<ToastError message={t("admin.failedLoadDocumentPreview")} />);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center animate-pulse text-slate-500">
        {t("common.loading")}
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="p-6 text-center text-slate-500">
        {t("common.noData")}
      </div>
    );
  }

  // 2. Map backend response data into the InvoiceForm defaultValues format
  const defaultValues = {
    departmentId: requestData.departmentId,
    requestType: requestData.requestType,
    paymentType: requestData.paymentType,
    bankName: requestData.bankName,
    beneficiaryName: requestData.beneficiaryName,
    accountNo: requestData.accountNo,
    bankBranch: requestData.bankBranch,
    swiftCode: requestData.swiftCode || "",
    purpose: requestData.purpose,
    vatPercent: requestData.vatPercent,
    vatAmount: requestData.vatAmount,
    pphPercent: requestData.pphPercent,
    pphAmount: requestData.pphAmount,
    items: requestData.details.map((detail) => ({
      id: detail.id,
      description: detail.description,
      invoiceNumber: detail.invoiceNumber || "",
      qty: detail.qty || 1,
      currencyId: detail.currencyId,
      price: detail.price,
      rate: detail.rate,
      subTotal:
        detail.price * detail.rate +
        (detail.vatAmount || 0) -
        (detail.pphAmount || 0),
      vatPercent: detail.vatPercent || 0,
      vatAmount: detail.vatAmount || 0,
      pphPercent: detail.pphPercent || 0,
      pphAmount: detail.pphAmount || 0,
      pphType: detail.pphType || "PPH21",
      filename: detail.filename || null,
    })),
  };

  const isRejected = requestData.status === DOCUMENT_STATUS.REJECTED;
  const isCanceled = requestData.status === DOCUMENT_STATUS.CANCELLED;
  const isRevision = requestData.status === DOCUMENT_STATUS.REVISION;
  const showReason =
    (isRejected || isCanceled || isRevision) && !!requestData.reason;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="p-4 md:p-6 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader
          title={t("breadcrumb.requestDetail")}
          subtitle={`${t("invoice.journalNo")}: ${requestData.number || "—"}`}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 p-3 px-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 w-fit">
            <span className="text-xs text-slate-500 font-medium">{t("columns.status")}:</span>
            <Badge
              style={
                requestData.status &&
                DOCUMENT_STATUS_COLOR[
                  requestData.status as keyof typeof DOCUMENT_STATUS_COLOR
                ]
                  ? {
                      backgroundColor:
                        DOCUMENT_STATUS_COLOR[
                          requestData.status as keyof typeof DOCUMENT_STATUS_COLOR
                        ].bg,
                      color:
                        DOCUMENT_STATUS_COLOR[
                          requestData.status as keyof typeof DOCUMENT_STATUS_COLOR
                        ].text,
                    }
                  : undefined
              }
              className="px-2.5 py-0.5 text-xs uppercase font-semibold rounded-md shadow-none border-none"
            >
              {requestData.status || "UNKNOWN"}
            </Badge>
          </div>
        </div>

        {showReason && (
          <Alert
            className={cn(
              "py-3.5 px-4 rounded-xl flex items-start gap-3 [&>svg]:relative [&>svg]:left-0 [&>svg]:top-0 [&>svg~*]:pl-0 animate-in fade-in duration-300",
              isRejected
                ? "bg-red-50/60 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-red-100 dark:border-red-900/40"
                : isRevision
                  ? "bg-orange-50/60 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 border-orange-100 dark:border-orange-900/40"
                  : "bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800/50",
            )}
          >
            <AlertCircle
              className={cn(
                "size-4 shrink-0 mt-0.5",
                isRejected
                  ? "text-red-600 dark:text-red-400"
                  : isRevision
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-slate-500",
              )}
            />
            <AlertDescription className="text-xs font-medium leading-relaxed">
              <strong className="block mb-1 text-sm font-semibold">
                {isRejected
                  ? t("invoice.rejectReason")
                  : isRevision
                    ? t("invoice.revisionReason")
                    : t("invoice.cancelReason")}
              </strong>
              <span>{requestData.reason}</span>
            </AlertDescription>
          </Alert>
        )}

        <InvoiceForm
          mode="view"
          requestId={id}
          defaultValues={defaultValues}
          existingFiles={{
            invoice_path: requestData.attachmentPath,
            faktur_pajak_path: requestData.formPath,
            approval_doc_path: requestData.approvalDocPath,
          }}
          isAdminEdit={requestData.status === DOCUMENT_STATUS.WAITING_APPROVAL}
          onAdminFieldsChange={setAdminFields}
        />

        {/* ── Settlement Information Section ── */}
        <SettlementDetailCard
          settleStatus={requestData.settleStatus}
          settleStatusLabel={requestData.settleStatusLabel}
          settleAmount={requestData.settleAmount}
          settleNote={requestData.settleNote}
          settlePaymentType={requestData.settlePaymentType}
          settlementDocPath={requestData.settlementDocPath}
          settlementDocPath2={requestData.settlementDocPath2}
          settlementTransferDocPath={requestData.settlementTransferDocPath}
          onPreview={handlePreview}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {requestData.status !== DOCUMENT_STATUS.WAITING_APPROVAL ? (
            <Alert className="max-w-xl bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-100 dark:border-amber-900/40 py-3 px-4 rounded-xl flex items-center gap-3 [&>svg]:relative [&>svg]:left-0 [&>svg]:top-0 [&>svg~*]:pl-0">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <AlertDescription className="text-xs font-medium leading-normal">
                {t("admin.onlyWaitingApprovalCanBeProcessed")}
              </AlertDescription>
            </Alert>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={
                requestData.status !== DOCUMENT_STATUS.WAITING_APPROVAL ||
                isSavingData
              }
              onClick={handleSaveData}
              variant="outline"
              className="h-10 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all active:scale-95 flex items-center gap-2 px-6 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSavingData ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSavingData ? t("company.saving") : t("company.saveChanges")}
            </Button>

            <Button
              disabled={
                requestData.status !== DOCUMENT_STATUS.WAITING_APPROVAL ||
                isSavingData
              }
              onClick={() => setIsUpdateDialogOpen(true)}
              className="h-10 rounded-xl bg-main hover:bg-main/90 text-white font-semibold transition-all active:scale-95 shadow-md shadow-main/10 flex items-center gap-2 px-6 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Settings className="size-4" />
              {t("admin.updateStatus")}
            </Button>
          </div>
        </div>
      </div>

      <UpdateStatusDialog
        id={isUpdateDialogOpen ? id : null}
        currentStatus={requestData.status}
        onClose={() => setIsUpdateDialogOpen(false)}
        selectedDepartmentId={adminFields.departmentId}
        selectedRequestType={adminFields.requestType}
      />
    </div>
  );
}
