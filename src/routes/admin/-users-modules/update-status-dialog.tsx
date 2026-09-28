import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircleIcon, Loader2Icon, InfoIcon } from "lucide-react";
import { DOCUMENT_STATUS, DOCUMENT_STATUS_COLOR } from "@/enums/document-status.enum";
import { cn } from "@/lib/utils";
import {
  updateAdminPortalUserStatus,
  type UpdateUserStatusBody,
} from "@/api/admin.api";
import type { NonVendorUser } from "@/types/non-vendor-user.type";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import { adminKeys } from "@/queries/admin.queries";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import getErrorMessage from "@/utils/error-message";

// Admin-selectable statuses
const ALLOWED_STATUS = [
  DOCUMENT_STATUS.PENDING,
  DOCUMENT_STATUS.APPROVED,
  DOCUMENT_STATUS.REVISION
] as const;

interface UpdateStatusDialogProps {
  user: NonVendorUser | null; // null = dialog closed
  onClose: () => void;
}

export function UpdateStatusDialog({ user, onClose }: UpdateStatusDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Local form state
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");
  const [vendorCode, setVendorCode] = React.useState<string>("");
  const [validationError, setValidationError] = React.useState<string>("");

  // Reset form every time the dialog is opened for a different user
  React.useEffect(() => {
    if (user) {
      setSelectedStatus("");
      setReason("");
      setVendorCode("");
      setValidationError("");
    }
  }, [user]);

  // TanStack Query Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserStatusBody }) =>
      updateAdminPortalUserStatus(id, body),
    onSuccess: () => {
      // Invalidate query to automatically refresh the table
      queryClient.invalidateQueries({
        queryKey: adminKeys.portalUsers.lists(),
      });
      toast(<ToastSuccess message={t("company.updateSuccess")} />);
      onClose();
    },
    onError: (error: AxiosError) => {
      const message = getErrorMessage(error) || t("company.updateError");
      setValidationError(message);
      toast(<ToastError message={message} />);
    },
  });

  const isRevision = selectedStatus === DOCUMENT_STATUS.REVISION;
  const isApprovedStatus = selectedStatus === DOCUMENT_STATUS.APPROVED;
  const isApproved = user?.status === DOCUMENT_STATUS.APPROVED;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validation: status must be selected
    if (!selectedStatus) {
      setValidationError(t("validation.statusRequired"));
      return;
    }

    // Validation: reason is required if REVISION
    if (isRevision && !reason.trim()) {
      setValidationError(t("validation.revisionReasonRequired"));
      return;
    }

    // Validation: vendorCode is required if APPROVED
    if (isApprovedStatus && !vendorCode.trim()) {
      setValidationError(t("validation.vendorCodeRequired"));
      return;
    }

    if (!user) return;

    mutate({
      id: user.id,
      body: {
        status: selectedStatus,
        reason: isRevision ? reason.trim() : undefined,
        vendorCode: isApprovedStatus ? vendorCode.trim() : undefined,
      },
    });
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{t("admin.updateUserStatus")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("admin.changeUserStatusDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* User info */}
        {user && (
          <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("columns.username")}</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("auth.companyName")}</span>
              <span className="font-medium">{user.companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("admin.currentStatus")}</span>
              {(() => {
                const colors =
                  DOCUMENT_STATUS_COLOR[user.status as keyof typeof DOCUMENT_STATUS_COLOR] ||
                  { bg: "#f3f4f6", text: "#374151" };
                return (
                  <Badge
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                    className="font-semibold shadow-none border-none text-xs"
                  >
                    {user.status}
                  </Badge>
                );
              })()}
            </div>
          </div>
        )}

        {/* Warning if status is APPROVED */}
        {isApproved && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <AlertCircleIcon className="size-4 mt-0.5 shrink-0" />
            <p>{t("admin.cannotChangeApprovedUser")}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Status */}
          <div className="space-y-2">
            <Label htmlFor="status-select" className="font-medium">
              {t("admin.newStatus")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setValidationError("");
                if (val !== DOCUMENT_STATUS.REVISION) setReason("");
                if (val !== DOCUMENT_STATUS.APPROVED) setVendorCode("");
              }}
              disabled={isApproved || isPending}
            >
              <SelectTrigger id="status-select" className="w-full">
                <SelectValue placeholder={t("admin.selectStatusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED_STATUS.map((status) => {
                  const colors =
                    DOCUMENT_STATUS_COLOR[status] || { bg: "#f3f4f6", text: "#374151" };
                  return (
                    <SelectItem key={status} value={status}>
                      <span
                        className="font-semibold text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {status}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Vendor Code Input & Notice (only shown if APPROVED is selected) */}
          {isApprovedStatus && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-2">
                <Label htmlFor="vendor-code-input" className="font-medium">
                  {t("admin.vendorCode")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vendor-code-input"
                  placeholder={t("admin.vendorCodePlaceholder")}
                  value={vendorCode}
                  onChange={(e) => {
                    setVendorCode(e.target.value);
                    setValidationError("");
                  }}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200/80 p-3 text-xs text-blue-900 leading-relaxed">
                <InfoIcon className="size-4 mt-0.5 shrink-0 text-blue-600" />
                <p>{t("admin.approveNote")}</p>
              </div>
            </div>
          )}

          {/* Reason Textarea (only shown if REVISION is selected) */}
          {isRevision && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label htmlFor="reason-input" className="font-medium">
                {t("invoice.revisionReason")} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason-input"
                placeholder={t("admin.revisionReasonPlaceholder")}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setValidationError("");
                }}
                disabled={isPending}
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Error message from validation or API */}
          {validationError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              <AlertCircleIcon className="size-4 mt-0.5 shrink-0" />
              <p>{validationError}</p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isApproved || isPending || !selectedStatus}
              className={cn(
                "flex-1 sm:flex-none bg-main hover:bg-main/90",
                "transition-all active:scale-95"
              )}
            >
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  {t("company.saving")}
                </>
              ) : (
                t("company.saveChanges")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

