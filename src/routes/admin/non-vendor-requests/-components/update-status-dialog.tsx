import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import {
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_COLOR,
} from "@/enums/document-status.enum";
import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import { nonVendorKeys } from "@/queries/non-vendor.queries";
import { useUpdateAdminPortalRequestStatusMutation } from "@/queries/admin.queries";
import getErrorMessage from "@/utils/error-message";
import {
  getPortalRequestDetail,
  updatePortalRequest,
} from "@/api/non-vendor.api";

const ALLOWED_STATUS = [
  DOCUMENT_STATUS.APPROVED,
  DOCUMENT_STATUS.REVISION,
  DOCUMENT_STATUS.CANCELLED,
] as const;

interface UpdateStatusDialogProps {
  id: string | null; // null = closed
  onClose: () => void;
  currentStatus?: string;
  selectedDepartmentId?: string | null;
  selectedRequestType?: number;
}

export function UpdateStatusDialog({
  id,
  onClose,
  currentStatus,
  selectedDepartmentId,
  selectedRequestType,
}: UpdateStatusDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAdminAuthStore();

  // Local form state
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");
  const [validationError, setValidationError] = React.useState<string>("");
  const [showConfirmation, setShowConfirmation] =
    React.useState<boolean>(false);
  const [isPendingLocal, setIsPendingLocal] = React.useState<boolean>(false);

  // Reset form when opened/closed
  React.useEffect(() => {
    if (id) {
      setSelectedStatus("");
      setReason("");
      setValidationError("");
      setShowConfirmation(false);
      setIsPendingLocal(false);
    }
  }, [id]);

  // mutation
  const { mutate, isPending } = useUpdateAdminPortalRequestStatusMutation();

  const isAnyPending = isPending || isPendingLocal;

  const isCanceled = selectedStatus === DOCUMENT_STATUS.CANCELLED;
  const isRevision = selectedStatus === DOCUMENT_STATUS.REVISION;

  const needsReason = isCanceled || isRevision;

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!selectedStatus) {
      setValidationError(t("validation.statusRequired"));
      return;
    }

    if (needsReason && !reason.trim()) {
      setValidationError(
        isCanceled
          ? t("admin.cancelReasonRequired")
          : t("validation.revisionReasonRequired"),
      );
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!user?.userId) {
      setValidationError(t("admin.adminUserContextMissing"));
      return;
    }

    try {
      setIsPendingLocal(true);
      setValidationError("");

      if (id) {
        const detailRes = await getPortalRequestDetail(id);
        const currentReq = detailRes.data;
        if (currentReq) {
          await updatePortalRequest(id, {
            departmentId: selectedDepartmentId ?? null,
            requestType: selectedRequestType ?? 0,
            paymentType: currentReq.paymentType,
            bankName: currentReq.bankName,
            beneficiaryName: currentReq.beneficiaryName,
            accountNo: currentReq.accountNo,
            bankBranch: currentReq.bankBranch,
            swiftCode: currentReq.swiftCode || undefined,
            purpose: currentReq.purpose,
            status: currentReq.status,
            vatAmount: currentReq.vatAmount,
            vatPercent: currentReq.vatPercent,
            pphAmount: currentReq.pphAmount,
            pphPercent: currentReq.pphPercent,
            portalNonVendorUserId: currentReq.portalNonVendorUserId,
            details: currentReq.details.map((d) => ({
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
            })),
          });
        }
      }

      mutate(
        {
          id: id || "",
          body: {
            userId: user.userId,
            status: selectedStatus,
            reason: needsReason ? reason.trim() : undefined,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: nonVendorKeys.portalRequests.all,
            });
            toast(
              <ToastSuccess message={t("invoice.updateSuccess")} />,
            );
            onClose();
          },
          onError: (error: AxiosError) => {
            setValidationError(getErrorMessage(error));
            setShowConfirmation(false);
          },
          onSettled: () => {
            setIsPendingLocal(false);
          },
        },
      );
    } catch (error: unknown) {
      setValidationError(getErrorMessage(error as AxiosError));
      setIsPendingLocal(false);
    }
  };

  return (
    <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {t("admin.updateRequestStatusTitle")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("admin.updateRequestStatusDesc")}
              </DialogDescription>
            </DialogHeader>

            {currentStatus && (
              <div className="rounded-lg bg-muted/40 px-4 py-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("admin.currentStatus")}</span>
                {(() => {
                  const colors = DOCUMENT_STATUS_COLOR[
                    currentStatus as keyof typeof DOCUMENT_STATUS_COLOR
                  ] || { bg: "#f3f4f6", text: "#374151" };
                  return (
                    <Badge
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                      className="font-semibold shadow-none border-none text-xs"
                    >
                      {currentStatus}
                    </Badge>
                  );
                })()}
              </div>
            )}

            <form onSubmit={handlePreSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status-select" className="font-medium">
                  {t("admin.newStatus")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(val) => {
                    setSelectedStatus(val);
                    setValidationError("");
                    if (
                      val !== DOCUMENT_STATUS.CANCELLED &&
                      val !== DOCUMENT_STATUS.REVISION
                    ) {
                      setReason("");
                    }
                  }}
                  disabled={isAnyPending}
                >
                  <SelectTrigger id="status-select" className="w-full">
                    <SelectValue placeholder={t("admin.selectStatusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_STATUS.map((status) => {
                      const colors = DOCUMENT_STATUS_COLOR[status] || {
                        bg: "#f3f4f6",
                        text: "#374151",
                      };
                      return (
                        <SelectItem key={status} value={status}>
                          <span
                            className="font-semibold text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                            }}
                          >
                            {status}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {needsReason && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="reason" className="font-medium">
                    {isCanceled ? t("admin.cancelReason") : t("admin.revisionReason")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder={
                      isCanceled
                        ? t("admin.cancelReasonPlaceholder")
                        : t("admin.revisionReasonPlaceholder")
                    }
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setValidationError("");
                    }}
                    disabled={isAnyPending}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}

              {validationError && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive animate-in fade-in">
                  <AlertCircleIcon className="size-4 mt-0.5 shrink-0" />
                  <p>{validationError}</p>
                </div>
              )}

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isAnyPending}
                  className="flex-1 sm:flex-none"
                >
                  {t("common.close")}
                </Button>
                <Button
                  type="submit"
                  disabled={isAnyPending || !selectedStatus}
                  className="flex-1 sm:flex-none bg-main hover:bg-main/90 transition-all active:scale-95 text-white"
                >
                  {t("company.saveChanges")}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-4 space-y-4 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto size-12 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center border border-amber-200 dark:border-amber-900/50">
              <AlertCircleIcon className="size-6 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t("admin.confirmStatusUpdateTitle")}
              </h3>
              <p className="text-sm text-muted-foreground px-2">
                {t("admin.confirmStatusUpdateDesc", { status: selectedStatus })}
              </p>
            </div>

            {validationError && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive text-left animate-in fade-in">
                <AlertCircleIcon className="size-4 mt-0.5 shrink-0" />
                <p>{validationError}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isAnyPending}
                className="flex-1"
              >
                {t("common.back")}
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSave}
                disabled={isAnyPending}
                className="flex-1 bg-main hover:bg-main/90 text-white transition-all active:scale-95"
              >
                {isAnyPending ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    {t("admin.processing")}
                  </>
                ) : (
                  t("admin.yesProcess")
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
