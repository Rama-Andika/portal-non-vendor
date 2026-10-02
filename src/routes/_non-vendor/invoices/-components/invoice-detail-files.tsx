import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Files, FileText, Eye, Paperclip, FileX, Loader2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import { DOCUMENT_STATUS } from "@/enums/document-status.enum";
import type { PortalRequestStatus } from "@/types/portal-request.type";
import type { InvoiceItemValues } from "@/validation/invoice-form.validation";
import type { StagedDetailFile } from "@/types/portal-request-detail-file.type";
import { getStagedDetailFile } from "@/utils/portal-request-detail-file";
import type { UseDetailFileActionsResult } from "./use-detail-file-actions";

interface InvoiceDetailFilesProps {
  /** Current form items (from useWatch("items")): number, description, id, filename. */
  items: InvoiceItemValues[];
  /** Portal request ID. undefined when creating a new invoice. */
  requestId?: string;
  /** Current request status. undefined when creating a new invoice. */
  status?: PortalRequestStatus;
  /** true when the form is read-only (view mode). */
  isReadOnly?: boolean;
  stagedDetailFiles: StagedDetailFile[];
  /** Shared file actions, created once in InvoiceForm. */
  actions: UseDetailFileActionsResult;
}

/** A file waiting for the user to confirm it may overwrite the existing one. */
interface PendingReplace {
  itemId: string;
  number: number;
  file: File;
}

/** A line item whose file is waiting for delete confirmation. */
interface PendingDelete {
  itemId: string;
  number: number;
  description: string;
}

export function InvoiceDetailFiles({
  items,
  requestId,
  status,
  isReadOnly = false,
  stagedDetailFiles,
  actions,
}: InvoiceDetailFilesProps) {
  const { t } = useTranslation();

  // One hidden file input per row, keyed by item ID.
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [pendingReplace, setPendingReplace] = useState<PendingReplace | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const isCreateMode = requestId === undefined;

  // Backend rule: upload & delete are only allowed when status is DRAFT or
  // REVISION. In create mode it is always allowed, since files are only staged.
  const canModify =
    !isReadOnly &&
    (isCreateMode ||
      status === DOCUMENT_STATUS.DRAFT ||
      status === DOCUMENT_STATUS.REVISION);

  const hasFile = (item: InvoiceItemValues): boolean =>
    !!item.filename || !!getStagedDetailFile(stagedDetailFiles, item.id);

  const withFileCount = items.filter(hasFile).length;
  const hasStagedFile = stagedDetailFiles.length > 0;

  const handleFileSelected = (
    item: InvoiceItemValues,
    index: number,
    file: File,
  ) => {
    if (!item.id) return;

    // Replacing an existing file is destructive on the server, so ask first.
    if (hasFile(item)) {
      setPendingReplace({ itemId: item.id, number: index + 1, file });
      return;
    }

    actions.selectFile({ itemId: item.id, file });
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    item: InvoiceItemValues,
    index: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingItemId(null);
    if (!canModify) return;

    // One line item holds one file, so only the first dropped file is used.
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFileSelected(item, index, file);
  };

  const handleConfirmReplace = () => {
    if (!pendingReplace) return;
    actions.selectFile({
      itemId: pendingReplace.itemId,
      file: pendingReplace.file,
    });
    setPendingReplace(null);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    actions.deleteFile(pendingDelete.itemId, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-main/10 flex items-center justify-center text-main shrink-0">
          <Files className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            {t("invoice.detailFiles.title")}
          </h3>
          <p className="text-[11px] text-slate-400">
            {t("invoice.detailFiles.counter", {
              current: withFileCount,
              total: items.length,
            })}
          </p>
        </div>
      </div>

      {/* ── Hints ── */}
      {canModify && items.length > 0 && (
        <p className="text-[11px] text-slate-400">
          {t("invoice.detailFiles.hint")}
        </p>
      )}

      {hasStagedFile && (
        <p className="text-[11px] font-semibold text-main">
          {t("invoice.detailFiles.createHint")}
        </p>
      )}

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <p className="text-xs text-slate-400">
          {t("invoice.detailFiles.empty")}
        </p>
      )}

      {/* ── One row per line item ── */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => {
            const number = index + 1;
            const stagedFile = getStagedDetailFile(stagedDetailFiles, item.id);
            const isUploadingRow = actions.uploadingItemId === item.id;
            const isDeletingRow = actions.deletingItemId === item.id;
            const isPreviewingRow = actions.previewingItemId === item.id;
            const isBusy = isUploadingRow || isDeletingRow;

            return (
              <div
                key={item.id || index}
                onDragOver={(e) => {
                  // preventDefault stays unconditional: without it the browser
                  // would open the dropped file and navigate away from the form.
                  e.preventDefault();
                  e.stopPropagation();
                  if (!canModify) {
                    // Show a "not allowed" cursor instead of inviting a drop
                    // that would silently be ignored.
                    e.dataTransfer.dropEffect = "none";
                    return;
                  }
                  e.dataTransfer.dropEffect = "copy";
                  setDraggingItemId(item.id);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDraggingItemId(null);
                }}
                onDrop={(e) => handleDrop(e, item, index)}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors duration-200",
                  stagedFile
                    ? "bg-main/5 border-dashed border-main/40"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
                  draggingItemId === item.id && "border-main bg-main/10",
                )}
              >
                {/* Left: row number, description, file status */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    #{number}
                  </span>
                  <FileText
                    className={cn(
                      "w-4 h-4 shrink-0",
                      stagedFile
                        ? "text-main"
                        : item.filename
                          ? "text-emerald-500"
                          : "text-slate-300",
                    )}
                  />
                  <div className="min-w-0">
                    <p
                      className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                      title={item.description || undefined}
                    >
                      {item.description || "—"}
                    </p>

                    {stagedFile ? (
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider text-main truncate"
                        title={stagedFile.name}
                      >
                        {stagedFile.name} &middot;{" "}
                        {t("invoice.detailFiles.pendingBadge")}
                      </p>
                    ) : item.filename ? (
                      <p
                        className="text-[10px] text-slate-400 truncate"
                        title={item.filename}
                      >
                        {item.filename}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        {t("invoice.detailFiles.noFile")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {item.filename && (
                    <button
                      type="button"
                      disabled={isPreviewingRow}
                      onClick={() =>
                        item.filename &&
                        actions.previewFile(item.filename, item.id)
                      }
                      title={t("invoice.detailFiles.view")}
                      className="text-main hover:text-main/80 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isPreviewingRow ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {canModify && (
                    <>
                      <input
                        ref={(el) => {
                          inputRefs.current[item.id] = el;
                        }}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) handleFileSelected(item, index, file);
                        }}
                      />
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => inputRefs.current[item.id]?.click()}
                        title={
                          hasFile(item)
                            ? t("invoice.detailFiles.reupload")
                            : t("invoice.detailFiles.upload")
                        }
                        className="text-slate-400 hover:text-main transition-colors duration-200 disabled:opacity-50"
                      >
                        {isUploadingRow ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}

                  {canModify && item.filename && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        setPendingDelete({
                          itemId: item.id,
                          number,
                          description: item.description,
                        })
                      }
                      title={t("invoice.detailFiles.delete")}
                      className="text-slate-400 hover:text-destructive transition-colors duration-200 disabled:opacity-50"
                    >
                      {isDeletingRow ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileX className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {canModify && stagedFile && (
                    <button
                      type="button"
                      onClick={() => actions.removeStagedFile(item.id)}
                      title={t("invoice.detailFiles.cancelStaged")}
                      className="text-slate-400 hover:text-destructive transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Replace confirmation ── */}
      <ConfirmDialog
        open={pendingReplace !== null}
        onOpenChange={(open) => {
          if (!open) setPendingReplace(null);
        }}
        onConfirm={handleConfirmReplace}
        variant="warning"
        title={t("invoice.detailFiles.replaceTitle")}
        description={t("invoice.detailFiles.replaceDesc", {
          number: pendingReplace?.number ?? 0,
          name: pendingReplace?.file.name ?? "",
        })}
        confirmText={t("invoice.detailFiles.reupload")}
        cancelText={t("common.cancel")}
      />

      {/* ── Delete confirmation ── */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={actions.isDeleting}
        variant="destructive"
        title={t("invoice.detailFiles.deleteTitle")}
        description={t("invoice.detailFiles.deleteDesc", {
          number: pendingDelete?.number ?? 0,
          description: pendingDelete?.description ?? "",
        })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
}
