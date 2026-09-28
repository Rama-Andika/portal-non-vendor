import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { AlertCircleIcon, Loader2Icon, InfoIcon } from "lucide-react";
import {
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_COLOR,
} from "@/enums/document-status.enum";
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
import { vendorQueries } from "@/queries/vendor.queries";
import type { Vendor } from "@/types/vendor.type";
import { VendorSearch } from "@/components/vendor/vendor-search";

// Admin-selectable statuses
const ALLOWED_STATUS = [
  DOCUMENT_STATUS.PENDING,
  DOCUMENT_STATUS.APPROVED,
  DOCUMENT_STATUS.REVISION,
] as const;

// Translation keys for the vendor validation hint shown when APPROVED is selected
type VendorHintKey =
  | "validation.vendorCodeRequired"
  | "admin.searchFirstHint"
  | "admin.selectVendorHint"
  | "admin.selectPkpHint"
  | "admin.vendorNotFoundHint"
  | "admin.vendorSearchErrorHint";

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
  const [validationError, setValidationError] = React.useState<string>("");
  const [vendorKeyword, setVendorKeyword] = React.useState<string>("");
  const [submittedVendorKeyword, setSubmittedVendorKeyword] =
    React.useState<string>("");
  const [selectedVendor, setSelectedVendor] = React.useState<Vendor | null>(
    null,
  );
  // Pilihan PKP/Non-PKP untuk vendor baru (dipakai di mode "Buat vendor baru")
  const [createPkp, setCreatePkp] = React.useState<0 | 1 | null>(null);
  // Mode vendor saat APPROVED: "existing" = pakai vendor yang sudah ada,
  // "create" = buat vendor baru.
  const [vendorMode, setVendorMode] = React.useState<"existing" | "create">(
    "existing",
  );

  // Reset form every time the dialog is opened for a different user
  React.useEffect(() => {
    if (user) {
      setSelectedStatus("");
      setReason("");
      setValidationError("");
      setVendorKeyword("");
      setSubmittedVendorKeyword("");
      setSelectedVendor(null);
      setCreatePkp(null);
      setVendorMode("existing");
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

  // Vendor search query (triggered only when submittedVendorKeyword is not empty)
  const vendorSearchQuery = useQuery(
    vendorQueries.search(submittedVendorKeyword),
  );
  const vendorResults = vendorSearchQuery.data?.data ?? [];
  const isVendorSearching = vendorSearchQuery.isFetching;
  const hasVendorSearched = submittedVendorKeyword.trim().length > 0;
  const vendorErrorMessage = vendorSearchQuery.isError
    ? getErrorMessage(vendorSearchQuery.error as AxiosError)
    : null;

  // Vendor validation hint (and whether submit must be blocked) when APPROVED:
  //  - mode "create" tanpa pilihan PKP            -> "admin.selectPkpHint"
  //  - mode "existing", keyword kosong            -> "validation.vendorCodeRequired"
  //  - mode "existing", belum klik Cari           -> "admin.searchFirstHint"
  //  - mode "existing", ada hasil belum pilih     -> "admin.selectVendorHint"
  //  - mode "existing", pencarian error           -> "admin.vendorSearchErrorHint"
  //  - mode "existing", tidak ada hasil           -> "admin.vendorNotFoundHint"
  //  - selain itu                                 -> boleh submit
  let vendorHintKey: VendorHintKey | null = null;
  if (isApprovedStatus) {
    if (vendorMode === "create") {
      if (createPkp === null) {
        vendorHintKey = "admin.selectPkpHint";
      }
    } else {
      if (!vendorKeyword.trim()) {
        vendorHintKey = "validation.vendorCodeRequired";
      } else if (!hasVendorSearched) {
        vendorHintKey = "admin.searchFirstHint";
      } else if (vendorResults.length > 0 && !selectedVendor) {
        vendorHintKey = "admin.selectVendorHint";
      } else if (vendorErrorMessage) {
        vendorHintKey = "admin.vendorSearchErrorHint";
      } else if (!selectedVendor) {
        vendorHintKey = "admin.vendorNotFoundHint";
      }
    }
  }
  const vendorBlocked = vendorHintKey !== null;

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

    // Validation: block submit when vendor selection is incomplete
    if (vendorHintKey) {
      setValidationError(t(vendorHintKey));
      return;
    }

    if (!user) return;

    mutate({
      id: user.id,
      body: {
        status: selectedStatus,
        reason: isRevision ? reason.trim() : undefined,
        ...(isApprovedStatus
          ? vendorMode === "create"
            ? { vendorId: "", isPkp: createPkp ?? 0 }
            : { vendorId: selectedVendor?.vendorId }
          : {}),
      },
    });
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t("admin.updateUserStatus")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("admin.changeUserStatusDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* User info */}
        {user && (
          <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-1 text-sm min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-muted-foreground shrink-0">
                {t("columns.username")}
              </span>
              <span className="font-medium truncate">{user.username}</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-muted-foreground shrink-0">
                {t("auth.companyName")}
              </span>
              <span className="font-medium truncate">{user.companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("admin.currentStatus")}
              </span>
              {(() => {
                const colors = DOCUMENT_STATUS_COLOR[
                  user.status as keyof typeof DOCUMENT_STATUS_COLOR
                ] || { bg: "#f3f4f6", text: "#374151" };
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
        <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
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
                if (val !== DOCUMENT_STATUS.APPROVED) {
                  setVendorKeyword("");
                  setSubmittedVendorKeyword("");
                  setSelectedVendor(null);
                  setCreatePkp(null);
                  setVendorMode("existing");
                }
              }}
              disabled={isApproved || isPending}
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

          {/* Vendor (only shown if APPROVED is selected) */}
          {isApprovedStatus && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Mode selector */}
              <div className="space-y-2">
                <Label className="font-medium">
                  {t("admin.vendorModeLabel")}
                </Label>
                <RadioGroup
                  value={vendorMode}
                  onValueChange={(val) =>
                    setVendorMode(val === "create" ? "create" : "existing")
                  }
                  disabled={isPending}
                  className="gap-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="existing"
                      id="vendor-mode-existing"
                    />
                    <Label
                      htmlFor="vendor-mode-existing"
                      className="font-normal cursor-pointer"
                    >
                      {t("admin.vendorModeExisting")}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="create" id="vendor-mode-create" />
                    <Label
                      htmlFor="vendor-mode-create"
                      className="font-normal cursor-pointer"
                    >
                      {t("admin.vendorModeCreate")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Mode existing: pencarian vendor */}
              {vendorMode === "existing" ? (
                <VendorSearch
                  keyword={vendorKeyword}
                  onKeywordChange={(value) => {
                    setVendorKeyword(value);
                    setSelectedVendor(null);
                  }}
                  onSearch={() =>
                    setSubmittedVendorKeyword(vendorKeyword.trim())
                  }
                  isSearching={isVendorSearching}
                  results={vendorResults}
                  hasSearched={hasVendorSearched}
                  errorMessage={vendorErrorMessage}
                  selectedVendor={selectedVendor}
                  onSelect={(vendor) => setSelectedVendor(vendor)}
                  onClear={() => setSelectedVendor(null)}
                  disabled={isPending}
                />
              ) : (
                /* Mode create: pilihan PKP/Non-PKP */
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label className="font-medium">
                    {t("admin.vendorPkpLabel")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={createPkp === null ? "" : String(createPkp)}
                    onValueChange={(val) => {
                      setCreatePkp(val === "1" ? 1 : 0);
                      setValidationError("");
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t("admin.selectPkpPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t("admin.pkpYes")}</SelectItem>
                      <SelectItem value="0">{t("admin.pkpNo")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {vendorHintKey && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-2 text-xs text-amber-800 leading-relaxed">
                  <InfoIcon className="size-4 mt-0.5 shrink-0 text-amber-600" />
                  <p>{t(vendorHintKey)}</p>
                </div>
              )}

              <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200/80 p-3 text-xs text-blue-900 leading-relaxed">
                <InfoIcon className="size-4 mt-0.5 shrink-0 text-blue-600" />
                <p>{t("admin.vendorSearchNote")}</p>
              </div>
            </div>
          )}

          {/* Reason Textarea (only shown if REVISION is selected) */}
          {isRevision && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label htmlFor="reason-input" className="font-medium">
                {t("invoice.revisionReason")}{" "}
                <span className="text-destructive">*</span>
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
              disabled={
                isApproved || isPending || !selectedStatus || vendorBlocked
              }
              className={cn(
                "flex-1 sm:flex-none bg-main hover:bg-main/90",
                "transition-all active:scale-95",
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
