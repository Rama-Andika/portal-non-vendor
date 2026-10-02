import {
  createFileRoute,
  useNavigate,
  useBlocker,
} from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { InvoiceForm } from "./-components/invoice-form";
import {
  useCreatePortalRequestMutation,
  useUploadPortalRequestDocumentsMutation,
} from "@/queries/non-vendor.queries";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import type { AxiosError } from "axios";
import getErrorMessage from "@/utils/error-message";
import type { InvoiceFormValues } from "@/validation/invoice-form.validation";
import type { PortalRequestStatus } from "@/types/portal-request.type";
import type { StagedDocument } from "@/types/portal-request-document.type";
import type { StagedDetailFile } from "@/types/portal-request-detail-file.type";
import { uploadStagedDetailFiles } from "@/utils/upload-staged-detail-files";
import { queryClient } from "@/queries/queryClient";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";

export const Route = createFileRoute("/_non-vendor/invoices/new")({
  component: CreateInvoicePage,
  staticData: {
    breadcrumb: "breadcrumb.newInvoice",
  },
});

function CreateInvoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useNonVendorAuthStore();
  const { mutate: createRequest, isPending } = useCreatePortalRequestMutation();
  const { mutateAsync: uploadDocuments } =
    useUploadPortalRequestDocumentsMutation();

  const [formIsDirty, setFormIsDirty] = useState(false);
  const isSubmittingSuccess = useRef(false);

  // Supporting documents selected by user but cannot be uploaded yet,
  // because the request ID only exists after the invoice is saved.
  const [stagedDocuments, setStagedDocuments] = useState<StagedDocument[]>([]);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);

  // Line item files cannot be uploaded yet either: the detail IDs only exist
  // after the invoice is saved.
  const [stagedDetailFiles, setStagedDetailFiles] = useState<
    StagedDetailFile[]
  >([]);
  const [isUploadingDetailFiles, setIsUploadingDetailFiles] = useState(false);

  // Selected files are also counted as unsaved changes,
  // so the user does not lose files when leaving the page.
  const hasUnsavedChanges =
    formIsDirty ||
    stagedDocuments.length > 0 ||
    stagedDetailFiles.length > 0;

  useBlocker({
    shouldBlockFn: ({ next }) => {
      if (isSubmittingSuccess.current) return false;
      if (!hasUnsavedChanges) return false;
      if (next?.pathname?.includes("/login")) return false;

      const shouldLeave = confirm(t("invoice.leaveConfirm"));
      return !shouldLeave;
    },
    enableBeforeUnload: hasUnsavedChanges,
  });

  // Confirmation State
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<InvoiceFormValues | null>(
    null,
  );

  const handleSuccess = (data: InvoiceFormValues) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingData) return;

    createRequest(
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
        status: pendingData.status as PortalRequestStatus,
        vatAmount: pendingData.vatAmount,
        vatPercent: pendingData.vatPercent,
        pphAmount: pendingData.pphAmount,
        pphPercent: pendingData.pphPercent,
        portalNonVendorUserId: user?.id ?? "",
        details: pendingData.items.map((item) => ({
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
        })),
      },
      {
        onSuccess: async (res) => {
          isSubmittingSuccess.current = true;
          setFormIsDirty(false);
          setShowConfirm(false);

          const newId = res?.data;

          // Request has been saved. The three cases below are handled
          // explicitly so that staged files are never dropped silently.
          if (stagedDocuments.length === 0) {
            // Case 1: nothing was staged, so there is nothing to upload.
            toast(
              <ToastSuccess message={t("invoice.requestCreatedSuccess")} />,
            );
          } else if (!newId) {
            // Case 2: the invoice was saved, but the server returned no ID,
            // so there is no request to attach the documents to. Say so
            // instead of showing a plain success toast and losing the files.
            toast(
              <ToastError
                message={t("invoice.documents.uploadNoRequestId")}
              />,
            );
          } else {
            // Case 3: upload every staged file in a single batch.
            setIsUploadingDocuments(true);
            try {
              await uploadDocuments({
                id: newId,
                files: stagedDocuments.map((doc) => doc.file),
              });
              toast(
                <ToastSuccess message={t("invoice.requestCreatedSuccess")} />,
              );
            } catch {
              toast(
                <ToastError
                  message={t("invoice.documents.uploadAfterCreateFailed")}
                />,
              );
            } finally {
              setIsUploadingDocuments(false);
              // Cleared so the blocker is not triggered when navigating away.
              setStagedDocuments([]);
            }
          }

          // Upload the staged line item files. Runs after the supporting
          // documents, and only once the detail IDs can be read back.
          if (stagedDetailFiles.length > 0) {
            if (!newId) {
              toast(
                <ToastError
                  message={t("invoice.detailFiles.uploadNoRequestId")}
                />,
              );
              setStagedDetailFiles([]);
            } else {
              setIsUploadingDetailFiles(true);
              try {
                const { failedNumbers, unmatchedNumbers } =
                  await uploadStagedDetailFiles({
                    requestId: newId,
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
                // Always cleared: the invoice is saved, and keeping the files
                // would block navigation. Failures are reported by toast.
                setStagedDetailFiles([]);
              }
            }
          }

          // Always navigate to the detail page whether upload succeeds or fails:
          // invoice is already saved and user can retry uploading there.
          if (newId) {
            navigate({
              to: "/invoices/$id/detail",
              params: { id: newId },
            });
          } else {
            navigate({ to: "/invoices" });
          }
        },
        onError: (err) => {
          setShowConfirm(false);
          const message = getErrorMessage(err as AxiosError);
          toast(
            <ToastError
              message={message || t("invoice.createRequestFailed")}
            />,
          );
        },
      },
    );
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="p-4 md:p-6 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader
          title={t("invoice.newTitle")}
          subtitle={t("invoice.newSubtitle")}
        />

        {(() => {
          const primaryBank =
            user?.banks?.find((b) => Number(b.isPrimary) === 1) ||
            user?.banks?.[0];
          return (
            <InvoiceForm
              mode="create"
              defaultValues={{
                bankName: primaryBank?.bankName || "",
                beneficiaryName: primaryBank?.beneficiaryName || "",
                accountNo: primaryBank?.accountNumber || "",
                bankBranch: primaryBank?.branch || "",
                swiftCode: primaryBank?.swiftCode || "",
              }}
              onSubmitSuccess={handleSuccess}
              isSubmitting={
                isPending || isUploadingDocuments || isUploadingDetailFiles
              }
              onDirtyChange={setFormIsDirty}
              stagedDocuments={stagedDocuments}
              onStagedDocumentsChange={setStagedDocuments}
              stagedDetailFiles={stagedDetailFiles}
              onStagedDetailFilesChange={setStagedDetailFiles}
            />
          );
        })()}
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending || isUploadingDocuments || isUploadingDetailFiles}
        title={
          pendingData?.status === "WAITING_APPROVAL"
            ? t("invoice.confirmSubmitTitle")
            : t("invoice.confirmSaveDraftTitle")
        }
        description={
          pendingData?.status === "WAITING_APPROVAL"
            ? t("invoice.confirmSubmitDesc")
            : t("invoice.confirmSaveDraftDesc")
        }
        confirmText={
          pendingData?.status === "WAITING_APPROVAL"
            ? t("common.submit")
            : t("common.saveDraft")
        }
      />
    </div>
  );
}
