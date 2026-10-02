import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import {
  useUploadNonVendorRequestDetailFileMutation,
  useDeleteNonVendorRequestDetailFileMutation,
} from "@/queries/non-vendor.queries";
import { getNonVendorRequestDetailFilePreview } from "@/api/non-vendor.api";
import { isFrontendUUID } from "@/utils/uuid";
import getErrorMessage from "@/utils/error-message";
import type { StagedDetailFile } from "@/types/portal-request-detail-file.type";
import {
  removeStagedDetailFile,
  setStagedDetailFile,
  validateDetailFile,
  type DetailFileValidationError,
} from "@/utils/portal-request-detail-file";

interface UseDetailFileActionsArgs {
  /** Portal request ID. undefined while creating a new invoice. */
  requestId?: string;
  /** Staging list. Owned by the page, so files survive refetches. */
  stagedDetailFiles: StagedDetailFile[];
  onStagedDetailFilesChange: (next: StagedDetailFile[]) => void;
}

export interface UseDetailFileActionsResult {
  /** Validates a file, then uploads it or puts it into staging. */
  selectFile: (args: { itemId: string; file: File }) => void;
  removeStagedFile: (itemId: string) => void;
  previewFile: (filename: string, itemId: string) => Promise<void>;
  deleteFile: (detailId: string, options?: { onSuccess?: () => void }) => void;
  /** ID of the line item currently uploading, so only its row spins. */
  uploadingItemId: string | null;
  deletingItemId: string | null;
  previewingItemId: string | null;
  /** True while any delete is running. Used to lock the confirm dialog. */
  isDeleting: boolean;
}

/**
 * Shared file actions for one invoice line item (detail).
 *
 * Call this ONCE, in InvoiceForm, and pass the result down. Calling it per row
 * would create one mutation per row.
 */
export function useDetailFileActions({
  requestId,
  stagedDetailFiles,
  onStagedDetailFilesChange,
}: UseDetailFileActionsArgs): UseDetailFileActionsResult {
  const { t } = useTranslation();

  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [previewingItemId, setPreviewingItemId] = useState<string | null>(null);

  const { mutate: uploadDetailFile } =
    useUploadNonVendorRequestDetailFileMutation(requestId ?? "");
  const { mutate: deleteDetailFile, isPending: isDeleting } =
    useDeleteNonVendorRequestDetailFileMutation(requestId ?? "");

  /** Converts a validation result into a translated message. */
  const getValidationMessage = (error: DetailFileValidationError): string => {
    switch (error.type) {
      case "pdfOnly":
        return t("invoice.detailFiles.errorPdfOnly");
      case "emptyFile":
        return t("invoice.detailFiles.errorEmptyFile", { name: error.name });
      case "maxSize":
        return t("invoice.detailFiles.errorMaxSize", { name: error.name });
    }
  };

  const selectFile = ({ itemId, file }: { itemId: string; file: File }) => {
    const error = validateDetailFile(file);
    if (error) {
      toast(<ToastError message={getValidationMessage(error)} />);
      return;
    }

    // A row can only be uploaded right away when the invoice exists AND the row
    // itself is already saved (its ID is a server ID, not a frontend UUID).
    const isSavedDetail = !!requestId && !isFrontendUUID(itemId);
    if (!isSavedDetail) {
      onStagedDetailFilesChange(
        setStagedDetailFile(stagedDetailFiles, itemId, file),
      );
      return;
    }

    setUploadingItemId(itemId);
    uploadDetailFile(
      { id: itemId, file },
      {
        onSuccess: () => {
          // Drop any leftover staged file for this row so it is not uploaded twice.
          onStagedDetailFilesChange(
            removeStagedDetailFile(stagedDetailFiles, itemId),
          );
          toast(
            <ToastSuccess message={t("invoice.detailFiles.uploadSuccess")} />,
          );
        },
        onError: (err) => {
          const message = getErrorMessage(err as AxiosError);
          toast(
            <ToastError
              message={message || t("invoice.detailFiles.uploadFailed")}
            />,
          );
        },
        onSettled: () => setUploadingItemId(null),
      },
    );
  };

  const removeStagedFile = (itemId: string) => {
    onStagedDetailFilesChange(
      removeStagedDetailFile(stagedDetailFiles, itemId),
    );
  };

  const previewFile = async (filename: string, itemId: string) => {
    setPreviewingItemId(itemId);
    try {
      const blob = await getNonVendorRequestDetailFilePreview(filename);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch {
      toast(<ToastError message={t("invoice.detailFiles.previewFailed")} />);
    } finally {
      setPreviewingItemId(null);
    }
  };

  const deleteFile = (
    detailId: string,
    options?: { onSuccess?: () => void },
  ) => {
    setDeletingItemId(detailId);
    deleteDetailFile(detailId, {
      onSuccess: () => {
        toast(<ToastSuccess message={t("invoice.detailFiles.deleteSuccess")} />);
        options?.onSuccess?.();
      },
      onError: (err) => {
        const message = getErrorMessage(err as AxiosError);
        toast(
          <ToastError
            message={message || t("invoice.detailFiles.deleteFailed")}
          />,
        );
      },
      onSettled: () => setDeletingItemId(null),
    });
  };

  return {
    selectFile,
    removeStagedFile,
    previewFile,
    deleteFile,
    uploadingItemId,
    deletingItemId,
    previewingItemId,
    isDeleting,
  };
}
