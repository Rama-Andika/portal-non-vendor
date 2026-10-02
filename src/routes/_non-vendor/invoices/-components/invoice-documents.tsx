import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Paperclip,
  UploadCloud,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import { cn } from "@/lib/utils";
import {
  nonVendorQueries,
  useUploadPortalRequestDocumentsMutation,
  useDeletePortalRequestDocumentMutation,
} from "@/queries/non-vendor.queries";
import {
  downloadPortalRequestDocument,
  downloadAllPortalRequestDocuments,
} from "@/api/non-vendor.api";
import { DOCUMENT_STATUS } from "@/enums/document-status.enum";
import type { PortalRequestStatus } from "@/types/portal-request.type";
import type {
  PortalRequestDocument,
  StagedDocument,
} from "@/types/portal-request-document.type";
import getErrorMessage, {
  parseBlobErrorMessage,
} from "@/utils/error-message";
import {
  MAX_DOCUMENTS_PER_REQUEST,
  MAX_TOTAL_DOCUMENT_SIZE_BYTES,
  createLocalId,
  formatFileSize,
  triggerBlobDownload,
  validateDocumentSelection,
  type DocumentValidationError,
} from "@/utils/portal-request-document";

interface InvoiceDocumentsProps {
  /** Portal request ID. undefined when creating a new invoice. */
  requestId?: string;
  /** Current request status. undefined when creating a new invoice. */
  status?: PortalRequestStatus;
  /** true when form is read-only (view mode). */
  isReadOnly?: boolean;
  /**
   * Files currently in staging. State is held by parent (page) because
   * in create mode files must be uploaded after the request is successfully created.
   */
  stagedDocuments: StagedDocument[];
  onStagedDocumentsChange: (next: StagedDocument[]) => void;
}

export function InvoiceDocuments({
  requestId,
  status,
  isReadOnly = false,
  stagedDocuments,
  onStagedDocumentsChange,
}: InvoiceDocumentsProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [documentToDelete, setDocumentToDelete] =
    useState<PortalRequestDocument | null>(null);

  // List of documents already saved on the server.
  // In create mode, requestId is empty so query is not executed.
  const { data: documentsResponse, isLoading } = useQuery(
    nonVendorQueries.portalRequestDocuments(requestId ?? ""),
  );
  const documents: PortalRequestDocument[] = documentsResponse?.data ?? [];

  const { mutate: uploadDocuments, isPending: isUploading } =
    useUploadPortalRequestDocumentsMutation();
  const { mutate: deleteDocument, isPending: isDeleting } =
    useDeletePortalRequestDocumentMutation(requestId ?? "");

  const isCreateMode = requestId === undefined;

  // Backend rule: upload & delete are only allowed when status is DRAFT or REVISION.
  // In create mode it is always allowed, since files are only staged in the browser.
  const canModifyDocuments =
    !isReadOnly &&
    (isCreateMode ||
      status === DOCUMENT_STATUS.DRAFT ||
      status === DOCUMENT_STATUS.REVISION);


  const totalCount = documents.length + stagedDocuments.length;
  const totalSize =
    documents.reduce((acc, doc) => acc + doc.fileSize, 0) +
    stagedDocuments.reduce((acc, doc) => acc + doc.file.size, 0);

  /** Converts validation result into translated error message. */
  const getValidationMessage = (error: DocumentValidationError): string => {
    switch (error.type) {
      case "pdfOnly":
        return t("invoice.documents.errorPdfOnly");
      case "emptyFile":
        return t("invoice.documents.errorEmptyFile", { name: error.name });
      case "maxSize":
        return t("invoice.documents.errorMaxSize", { name: error.name });
      case "maxCount":
        return t("invoice.documents.errorMaxCount", { max: error.max });
      case "maxTotalSize":
        return t("invoice.documents.errorMaxTotalSize", {
          maxSize: error.maxSize,
        });
    }
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    const { accepted, error } = validateDocumentSelection({
      incoming: files,
      uploaded: documents,
      staged: stagedDocuments,
    });

    if (error) {
      toast(<ToastError message={getValidationMessage(error)} />);
      return;
    }

    onStagedDocumentsChange([
      ...stagedDocuments,
      ...accepted.map((file) => ({ localId: createLocalId(), file })),
    ]);
  };

  const handleRemoveStaged = (localId: string) => {
    onStagedDocumentsChange(
      stagedDocuments.filter((doc) => doc.localId !== localId),
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFilesSelected(Array.from(e.dataTransfer.files ?? []));
  };

  const handleUploadStaged = () => {
    if (!requestId || stagedDocuments.length === 0) return;

    uploadDocuments(
      { id: requestId, files: stagedDocuments.map((doc) => doc.file) },
      {
        onSuccess: () => {
          onStagedDocumentsChange([]);
          toast(
            <ToastSuccess message={t("invoice.documents.uploadSuccess")} />,
          );
        },
        onError: (error) => {
          // Staging is NOT cleared: upload is all-or-nothing,
          // so the user still needs to fix the issue and try again.
          const message = getErrorMessage(error as AxiosError);
          toast(
            <ToastError
              message={message || t("invoice.documents.uploadFailed")}
            />,
          );
        },
      },
    );
  };

  const handlePreview = async (doc: PortalRequestDocument) => {
    setBusyDocumentId(doc.id);
    try {
      const blob = await downloadPortalRequestDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      const message = await parseBlobErrorMessage(error);
      toast(
        <ToastError
          message={message || t("invoice.documents.downloadFailed")}
        />,
      );
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handleDownload = async (doc: PortalRequestDocument) => {
    setBusyDocumentId(doc.id);
    try {
      const blob = await downloadPortalRequestDocument(doc.id);
      triggerBlobDownload(blob, doc.originalName);
    } catch (error) {
      const message = await parseBlobErrorMessage(error);
      toast(
        <ToastError
          message={message || t("invoice.documents.downloadFailed")}
        />,
      );
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!requestId) return;

    setIsDownloadingAll(true);
    try {
      const blob = await downloadAllPortalRequestDocuments(requestId);
      triggerBlobDownload(
        blob,
        `portal-non-vendor-request-${requestId}-documents.zip`,
      );
    } catch (error) {
      const message = await parseBlobErrorMessage(error);
      toast(
        <ToastError
          message={message || t("invoice.documents.downloadFailed")}
        />,
      );
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!documentToDelete) return;

    deleteDocument(documentToDelete.id, {
      onSuccess: () => {
        setDocumentToDelete(null);
        toast(<ToastSuccess message={t("invoice.documents.deleteSuccess")} />);
      },
      onError: (error) => {
        const message = getErrorMessage(error as AxiosError);
        toast(
          <ToastError
            message={message || t("invoice.documents.deleteFailed")}
          />,
        );
      },
    });
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-main/10 flex items-center justify-center text-main shrink-0">
            <Paperclip className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {t("invoice.documents.title")}
            </h3>
            <p className="text-[11px] text-slate-400">
              {t("invoice.documents.counter", {
                current: totalCount,
                max: MAX_DOCUMENTS_PER_REQUEST,
                size: formatFileSize(totalSize),
                maxSize: formatFileSize(MAX_TOTAL_DOCUMENT_SIZE_BYTES),
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="rounded-xl h-10 px-4 text-xs font-bold"
            >
              {isDownloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {t("invoice.documents.downloadAll")}
            </Button>
          )}

          {canModifyDocuments &&
            !isCreateMode &&
            stagedDocuments.length > 0 && (
              <Button
                type="button"
                onClick={handleUploadStaged}
                disabled={isUploading}
                className="bg-main hover:bg-main/90 text-white rounded-xl h-10 px-5 shadow-lg shadow-main/20 text-xs font-bold transition-all active:scale-95"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploading
                  ? t("invoice.documents.uploading")
                  : t("invoice.documents.uploadButton")}
              </Button>
            )}
        </div>
      </div>

      {/* ── Hint ── */}
      {isCreateMode && (
        <p className="text-[11px] text-slate-400">
          {t("invoice.documents.createHint")}
        </p>
      )}

      {!isCreateMode && isLoading && (
        <p className="text-xs text-slate-400 animate-pulse">
          {t("common.loading")}
        </p>
      )}

      {/* ── List of documents already saved on server ── */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 shrink-0 text-emerald-500" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {doc.originalName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatFileSize(doc.fileSize)} &middot; {doc.uploadedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {busyDocumentId === doc.id ? (
                  <Loader2 className="w-4 h-4 text-main animate-spin" />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePreview(doc)}
                      title={t("invoice.documents.preview")}
                      className="text-main hover:text-main/80 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      title={t("invoice.documents.download")}
                      className="text-slate-400 hover:text-main transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {canModifyDocuments && (
                      <button
                        type="button"
                        onClick={() => setDocumentToDelete(doc)}
                        title={t("common.delete")}
                        className="text-slate-400 hover:text-destructive transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── List of staged files (not yet uploaded) ── */}
      {stagedDocuments.length > 0 && (
        <div className="space-y-2">
          {stagedDocuments.map((staged) => (
            <div
              key={staged.localId}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-main/5 border border-dashed border-main/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 shrink-0 text-main" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {staged.file.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-main">
                    {formatFileSize(staged.file.size)} &middot;{" "}
                    {t("invoice.documents.pendingBadge")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => handleRemoveStaged(staged.localId)}
                title={t("common.cancel")}
                className="text-slate-400 hover:text-destructive transition-colors duration-200 shrink-0 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Dropzone ── */}
      {canModifyDocuments && totalCount < MAX_DOCUMENTS_PER_REQUEST && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-1.5 cursor-pointer transition-all group duration-200",
              isDragging
                ? "border-main bg-main/10"
                : "border-slate-200 dark:border-slate-700 hover:border-main hover:bg-main/5",
            )}
          >
            <UploadCloud className="w-5 h-5 text-slate-300 group-hover:text-main pointer-events-none" />
            <p className="text-[11px] font-semibold text-slate-500 group-hover:text-main pointer-events-none">
              {t("invoice.documents.addDocuments")}
            </p>
            <p className="text-[10px] text-slate-400 text-center pointer-events-none">
              {t("invoice.documents.dropHint")}
            </p>
          </div>
        </>
      )}

      {/* ── Empty state ── */}
      {totalCount === 0 && !canModifyDocuments && !isLoading && (
        <p className="text-xs text-slate-400">
          {t("invoice.documents.empty")}
        </p>
      )}

      <ConfirmDialog
        open={documentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setDocumentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="destructive"
        title={t("invoice.documents.deleteTitle")}
        description={t("invoice.documents.deleteDesc", {
          name: documentToDelete?.originalName ?? "",
        })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
}
