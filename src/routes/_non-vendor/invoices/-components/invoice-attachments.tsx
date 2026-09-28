import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Paperclip,
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  Upload,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import { useUploadNonVendorRequestFileMutation } from "@/queries/non-vendor.queries";
import { getNonVendorRequestFilePreview } from "@/api/non-vendor.api";

interface InvoiceAttachmentsProps {
  requestId?: string;
  isReadOnly?: boolean;
  existingFiles?: {
    invoice_path?: string | null;
    faktur_pajak_path?: string | null;
    approval_doc_path?: string | null;
  };
}

export function InvoiceAttachments({
  requestId,
  isReadOnly = false,
  existingFiles,
}: InvoiceAttachmentsProps) {
  const { t } = useTranslation();
  const { mutateAsync: uploadFile } = useUploadNonVendorRequestFileMutation();

  const [docs, setDocs] = useState<{
    invoice_path: { file: File | null; status: "idle" | "uploading" | "success" | "error" };
    faktur_pajak_path: { file: File | null; status: "idle" | "uploading" | "success" | "error" };
    approval_doc_path: { file: File | null; status: "idle" | "uploading" | "success" | "error" };
  }>({
    invoice_path: { file: null, status: "idle" },
    faktur_pajak_path: { file: null, status: "idle" },
    approval_doc_path: { file: null, status: "idle" },
  });

  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const updateDoc = (
    type: keyof typeof docs,
    data: Partial<(typeof docs)[keyof typeof docs]>
  ) => {
    setDocs((prev) => ({
      ...prev,
      [type]: { ...prev[type], ...data },
    }));
  };

  useEffect(() => {
    if (existingFiles?.invoice_path) {
      updateDoc("invoice_path", { file: null, status: "idle" });
    }
    if (existingFiles?.faktur_pajak_path) {
      updateDoc("faktur_pajak_path", { file: null, status: "idle" });
    }
    if (existingFiles?.approval_doc_path) {
      updateDoc("approval_doc_path", { file: null, status: "idle" });
    }
  }, [
    existingFiles?.invoice_path,
    existingFiles?.faktur_pajak_path,
    existingFiles?.approval_doc_path,
  ]);

  const handleFileSelect = (type: keyof typeof docs, file: File) => {
    if (file.type !== "application/pdf") {
      toast(<ToastError message={t("settlement.onlyPdfAllowed")} />);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast(<ToastError message={t("settlement.maxSize2mb")} />);
      return;
    }
    updateDoc(type, { file, status: "idle" });
  };

  const handleRemoveFile = (type: keyof typeof docs) => {
    updateDoc(type, { file: null, status: "idle" });
  };

  const handleUploadAll = async () => {
    if (!requestId) {
      toast(<ToastError message={t("common.noData")} />);
      return;
    }

    const pendingUploads = Object.entries(docs)
      .filter(([_, data]) => data.file !== null && data.status !== "success")
      .map(([type, data]) => ({ type: type as keyof typeof docs, file: data.file as File }));

    if (pendingUploads.length === 0) {
      toast.info(t("invoice.noFilesUpload"));
      return;
    }

    setIsUploadingAll(true);
    let allSuccess = true;

    for (const upload of pendingUploads) {
      try {
        updateDoc(upload.type, { status: "uploading" });
        await uploadFile({ id: requestId, type: upload.type, file: upload.file });
        updateDoc(upload.type, { status: "success" });
      } catch (error) {
        updateDoc(upload.type, { status: "error" });
        allSuccess = false;
      }
    }

    setIsUploadingAll(false);

    if (allSuccess) {
      toast(<ToastSuccess message={t("invoice.allFilesSuccess")} />);
    } else {
      toast(<ToastError message={t("invoice.uploadFailedSome")} />);
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
    } catch (error) {
      toast.dismiss("preview-loading");
      toast(<ToastError message={t("admin.failedLoadDocumentPreview")} />);
    }
  };

  const hasPendingFiles = Object.values(docs).some(
    (data) => data.file !== null && data.status !== "success"
  );

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-8 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-main/10 flex items-center justify-center text-main">
            <Paperclip className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            {t("common.attachments")}
          </h3>
        </div>

        {!isReadOnly && hasPendingFiles && (
          <Button
            type="button"
            onClick={handleUploadAll}
            disabled={isUploadingAll}
            className="bg-main hover:bg-main/90 text-white rounded-xl px-6 h-10 shadow-lg shadow-main/20 font-bold text-xs transition-all active:scale-95 flex items-center gap-2"
          >
            {isUploadingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploadingAll ? t("common.uploading") : t("common.uploadAllFiles")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <FileDropzoneItem
          label={t("invoice.attachmentInvoice")}
          description={t("invoice.attachmentInvoiceDesc")}
          file={docs.invoice_path.file}
          status={docs.invoice_path.status}
          isReadOnly={isReadOnly}
          existingFilename={existingFiles?.invoice_path}
          onSelect={(file) => handleFileSelect("invoice_path", file)}
          onRemove={() => handleRemoveFile("invoice_path")}
          onPreview={existingFiles?.invoice_path ? () => handlePreview(existingFiles.invoice_path!) : undefined}
        />

        <FileDropzoneItem
          label={t("invoice.attachmentOther")}
          description={t("invoice.attachmentOtherDesc")}
          file={docs.faktur_pajak_path.file}
          status={docs.faktur_pajak_path.status}
          isReadOnly={isReadOnly}
          existingFilename={existingFiles?.faktur_pajak_path}
          onSelect={(file) => handleFileSelect("faktur_pajak_path", file)}
          onRemove={() => handleRemoveFile("faktur_pajak_path")}
          onPreview={existingFiles?.faktur_pajak_path ? () => handlePreview(existingFiles.faktur_pajak_path!) : undefined}
        />
      </div>
    </div>
  );
}

// Reusable Dropzone Sub-component
interface FileDropzoneItemProps {
  label: string;
  description: string;
  file: File | null;
  status: "idle" | "uploading" | "success" | "error";
  isReadOnly: boolean;
  existingFilename?: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onPreview?: () => void;
}

function FileDropzoneItem({
  label,
  description,
  file,
  status,
  isReadOnly,
  existingFilename,
  onSelect,
  onRemove,
  onPreview,
}: FileDropzoneItemProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onSelect(selectedFile);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4 flex flex-col justify-between">
      {!isReadOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      {file ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 truncate">
            <FileText
              className={cn(
                "w-4 h-4 shrink-0",
                status === "success" ? "text-emerald-500" : "text-main"
              )}
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {file.name}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            {status === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : status === "uploading" ? (
              <Loader2 className="w-4 h-4 text-main animate-spin" />
            ) : status === "error" ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : !isReadOnly ? (
              <button
                type="button"
                onClick={onRemove}
                className="text-slate-400 hover:text-destructive transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : existingFilename ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 truncate">
            <FileText className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {existingFilename}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <button
              type="button"
              onClick={onPreview}
              className="text-main hover:text-main/80 transition-colors duration-200"
              title={t("invoice.previewFile")}
            >
              <Eye className="w-4 h-4" />
            </button>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-slate-400 hover:text-main transition-colors duration-200"
                title={t("invoice.replaceFile")}
              >
                <UploadCloud className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        !isReadOnly && (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer border-slate-200 hover:border-main hover:bg-main/5 transition-all group duration-200"
          >
            <UploadCloud className="w-6 h-6 text-slate-300 group-hover:text-main" />
            <p className="text-xs font-semibold text-slate-500 group-hover:text-main">
              {t("common.addDocument")}
            </p>
          </div>
        )
      )}
    </div>
  );
}
