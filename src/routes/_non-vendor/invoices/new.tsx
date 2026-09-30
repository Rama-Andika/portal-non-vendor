import {
  createFileRoute,
  useNavigate,
  useBlocker,
} from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { InvoiceForm } from "./-components/invoice-form";
import { useCreatePortalRequestMutation } from "@/queries/non-vendor.queries";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import type { AxiosError } from "axios";
import getErrorMessage from "@/utils/error-message";
import type { InvoiceFormValues } from "@/validation/invoice-form.validation";
import type { PortalRequestStatus } from "@/types/portal-request.type";
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

  const [formIsDirty, setFormIsDirty] = useState(false);
  const isSubmittingSuccess = useRef(false);

  useBlocker({
    shouldBlockFn: ({ next }) => {
      if (isSubmittingSuccess.current) return false;
      if (!formIsDirty) return false;
      if (next?.pathname?.includes("/login")) return false;

      const shouldLeave = confirm(t("invoice.leaveConfirm"));
      return !shouldLeave;
    },
    enableBeforeUnload: formIsDirty,
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
        onSuccess: (res) => {
          isSubmittingSuccess.current = true;
          setFormIsDirty(false);
          setShowConfirm(false);
          toast(<ToastSuccess message={t("invoice.requestCreatedSuccess")} />);
          const newId = res?.data;
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
              isSubmitting={isPending}
              onDirtyChange={setFormIsDirty}
            />
          );
        })()}
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
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
