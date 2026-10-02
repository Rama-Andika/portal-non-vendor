import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  nonVendorQueries,
  useUpdatePortalRequestMutation,
} from "@/queries/non-vendor.queries";
import { InvoiceForm } from "./-components/invoice-form";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import getErrorMessage from "@/utils/error-message";
import { isFrontendUUID } from "@/utils/uuid";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import type { AxiosError } from "axios";

import { queryClient } from "@/queries/queryClient";
import { AlertCircle } from "lucide-react";
import { SettlementDetailCard } from "@/components/settlement/settlement-detail-card";
import { getNonVendorRequestFilePreview } from "@/api/non-vendor.api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { InvoiceFormValues } from "@/validation/invoice-form.validation";
import type { PortalRequestStatus } from "@/types/portal-request.type";
import type { StagedDocument } from "@/types/portal-request-document.type";
import type { StagedDetailFile } from "@/types/portal-request-detail-file.type";
import { uploadStagedDetailFiles } from "./-components/upload-staged-detail-files";
import {
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_COLOR,
  type DocumentStatusType,
} from "@/enums/document-status.enum.ts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_non-vendor/invoices/$id/detail")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(
      nonVendorQueries.portalRequestDetail(params.id),
    ),
  component: UpdateInvoicePage,
  staticData: {
    breadcrumb: "Update Invoice",
  },
});

function UpdateInvoicePage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const { user } = useNonVendorAuthStore();

  // 1. Fetching detail data
  const { data: response, isLoading } = useQuery(
    nonVendorQueries.portalRequestDetail(id),
  );
  const requestData = response?.data;

  // 1b. Supporting documents list.
  // Uses the same query key as InvoiceDocuments, so data is
  // shared from the same cache and does not cause duplicate requests.
  const {
    data: documentsResponse,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
  } = useQuery(nonVendorQueries.portalRequestDocuments(id));
  const documents = documentsResponse?.data ?? [];

  // 2. Setup mutations & local states
  const { mutate: updateRequest, isPending } =
    useUpdatePortalRequestMutation(id);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<InvoiceFormValues | null>(
    null,
  );
  const [stagedDocuments, setStagedDocuments] = useState<StagedDocument[]>([]);

  // Files for rows that do not have a server ID yet (newly added rows).
  const [stagedDetailFiles, setStagedDetailFiles] = useState<
    StagedDetailFile[]
  >([]);
  const [isUploadingDetailFiles, setIsUploadingDetailFiles] = useState(false);

  // Bumped after a successful save so InvoiceForm remounts and picks up the
  // server data again. Without it, `keepDirtyValues` makes the form keep the
  // frontend UUIDs and miss the freshly uploaded file names.
  const [formVersion, setFormVersion] = useState(0);

  // 5. Mapping respons data ke default values form
  const defaultValues = useMemo(() => {
    if (!requestData) return undefined;

    return {
      departmentId: requestData.departmentId,
      requestType: requestData.requestType,
      paymentType: requestData.paymentType,
      bankName: requestData.bankName,
      beneficiaryName: requestData.beneficiaryName,
      accountNo: requestData.accountNo,
      bankBranch: requestData.bankBranch,
      swiftCode: requestData.swiftCode || "",
      purpose: requestData.purpose,
      status: requestData.status as PortalRequestStatus,
      date: requestData.date,
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
  }, [requestData]);

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

  // Business Rule: Can only be edited if status is DRAFT or REVISION.
  // REJECTED is intentionally excluded: the backend forbids uploading or
  // deleting supporting documents outside DRAFT/REVISION, so allowing edits
  // here would let the user reach the submit button without any way to
  // satisfy the "at least one supporting document" requirement.
  const isEditable =
    requestData.status === DOCUMENT_STATUS.DRAFT ||
    requestData.status === DOCUMENT_STATUS.REVISION;

  // 4. Handle Save / Update
  const handleSuccess = (formData: InvoiceFormValues) => {
    // Prevent the user from saving while there are still files in staging,
    // so that those files are not lost unnoticed.
    if (stagedDocuments.length > 0) {
      toast(
        <ToastError message={t("invoice.documents.pendingUploadWarning")} />,
      );
      return;
    }

    // Business rule: submitting to WAITING_APPROVAL requires
    // at least 1 supporting document already uploaded.
    //
    // The three checks below are deliberately separate. An empty `documents`
    // array can also mean "the list has not arrived yet" or "the request
    // failed", and treating those as "this invoice has no documents" would
    // tell the user to upload a file that may already exist.
    if (formData.status === "WAITING_APPROVAL") {
      if (isDocumentsLoading) {
        toast(
          <ToastError message={t("invoice.documents.listStillLoading")} />,
        );
        return;
      }

      // `!documentsResponse` matters here: the query refetches on every mount,
      // and a failed refetch sets `isError` while keeping the previously
      // cached list. Blocking on `isError` alone would reject a submit whose
      // requirement is already satisfied by that still-valid cached data.
      if (isDocumentsError && !documentsResponse) {
        toast(<ToastError message={t("invoice.documents.listLoadFailed")} />);
        return;
      }

      if (documents.length === 0) {
        toast(<ToastError message={t("invoice.documents.requiredOnSubmit")} />);
        return;
      }
    }

    setPendingData(formData);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingData) return;

    updateRequest(
      {
        departmentId: pendingData.departmentId ?? null,
        requestType: String(pendingData.requestType),
        paymentType: String(pendingData.paymentType),
        bankName: pendingData.bankName,
        beneficiaryName: pendingData.beneficiaryName,
        accountNo: pendingData.accountNo,
        bankBranch: pendingData.bankBranch,
        swiftCode: pendingData.swiftCode || undefined,
        purpose: pendingData.purpose,
        status: (pendingData.status === "WAITING_APPROVAL"
          ? "WAITING_APPROVAL"
          : requestData?.status || pendingData.status) as PortalRequestStatus,
        vatAmount: pendingData.vatAmount,
        vatPercent: pendingData.vatPercent,
        pphAmount: pendingData.pphAmount,
        pphPercent: pendingData.pphPercent,
        portalNonVendorUserId: user?.id ?? "",
        details: pendingData.items.map((item) => {
          const isUuid = isFrontendUUID(item.id);
          return {
            ...(item.id && !isUuid ? { id: String(item.id) } : {}),
            description: item.description,
            invoiceNumber: item.invoiceNumber || "",
            qty: item.qty || 1,
            currencyId: item.currencyId,
            price: item.price,
            rate: item.rate,
            vatPercent: item.vatPercent,
            vatAmount: item.vatAmount,
            pphPercent: item.pphPercent,
            pphAmount: item.pphAmount,
            pphType: item.pphType,
          };
        }),
      },
      {
        onSuccess: async () => {
          setShowConfirm(false);
          setPendingData(null);
          toast(<ToastSuccess message={t("invoice.updateSuccess")} />);

          // Rows that were added in this session only get a server ID now, so
          // their staged files are uploaded after the update succeeds.
          if (stagedDetailFiles.length > 0) {
            setIsUploadingDetailFiles(true);
            try {
              const { failedNumbers, unmatchedNumbers } =
                await uploadStagedDetailFiles({
                  requestId: id,
                  submittedItems: pendingData.items,
                  staged: stagedDetailFiles,
                  queryClient,
                });

              if (failedNumbers.length > 0) {
                toast(
                  <ToastError
                    message={t("invoice.detailFiles.uploadAfterSaveFailed", {
                      numbers: failedNumbers.join(", "),
                    })}
                  />,
                );
              }

              if (unmatchedNumbers.length > 0) {
                toast(
                  <ToastError
                    message={t("invoice.detailFiles.uploadAfterSaveMismatch")}
                  />,
                );
              }
            } catch {
              toast(
                <ToastError
                  message={t("invoice.detailFiles.uploadAfterSaveError")}
                />,
              );
            } finally {
              setIsUploadingDetailFiles(false);
              setStagedDetailFiles([]);
            }
          }

          // Re-sync the form with the server (new detail IDs + file names).
          setFormVersion((version) => version + 1);
        },
        onError: (err) => {
          const message = getErrorMessage(err as AxiosError);
          toast(
            <ToastError message={message || t("invoice.updateError")} />,
          );
        },
      },
    );
  };

  const handlePreview = async (filename: string) => {
    try {
      const blob = await getNonVendorRequestFilePreview(filename);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error(t("admin.failedLoadDocumentPreview"));
    }
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
          title={isEditable ? t("invoice.updateInvoice") : t("invoice.viewInvoice")}
          subtitle={t("invoice.subtitle")}
        />

        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t("columns.status")}
            </span>
            <Badge
              className="px-3 py-1 text-xs uppercase font-bold rounded-lg shadow-none border-none"
              style={{
                backgroundColor:
                  DOCUMENT_STATUS_COLOR[
                    requestData.status as DocumentStatusType
                  ]?.bg || "#E2E8F0",
                color:
                  DOCUMENT_STATUS_COLOR[
                    requestData.status as DocumentStatusType
                  ]?.text || "#475569",
              }}
            >
              {requestData.status}
            </Badge>
          </div>
        </div>

        {!isEditable && (
          <div className="flex items-start md:items-center gap-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 p-4 rounded-xl text-sm mb-4 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 md:mt-0 animate-pulse" />
            <span className="leading-relaxed">
              {t("invoice.statusNotice", { status: requestData.status })}
            </span>
          </div>
        )}

        {showReason && (
          <Alert
            className={cn(
              "py-3.5 px-4 rounded-xl flex items-start gap-3 [&>svg]:relative [&>svg]:left-0 [&>svg]:top-0 [&>svg~*]:pl-0 mb-4 animate-in fade-in duration-300",
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
          key={formVersion}
          mode={isEditable ? "edit" : "view"}
          requestId={id}
          defaultValues={defaultValues}
          onSubmitSuccess={handleSuccess}
          isSubmitting={isPending || isUploadingDetailFiles}
          status={requestData.status as PortalRequestStatus}
          stagedDocuments={stagedDocuments}
          onStagedDocumentsChange={setStagedDocuments}
          stagedDetailFiles={stagedDetailFiles}
          onStagedDetailFilesChange={setStagedDetailFiles}
          journalNo={requestData.number || undefined}
        />

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

        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          onConfirm={handleConfirmSubmit}
          title={
            pendingData?.status === "DRAFT"
              ? t("invoice.confirmSaveDraftTitle")
              : t("invoice.confirmSubmitTitle")
          }
          description={
            pendingData?.status === "DRAFT"
              ? t("invoice.confirmSaveDraftDesc")
              : t("invoice.confirmSubmitDesc")
          }
          confirmText={
            pendingData?.status === "DRAFT" ? t("common.saveDraft") : t("common.submit")
          }
          cancelText={t("common.cancel")}
          isLoading={isPending || isUploadingDetailFiles}
        />
      </div>
    </div>
  );
}
