import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ToastSuccess from "@/components/toast/toast-success";
import ToastError from "@/components/toast/toast-error";
import { Loader2Icon, UploadIcon, FileIcon } from "lucide-react";
import { useUploadNonVendorRequestFileMutation } from "@/queries/non-vendor.queries";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import getErrorMessage from "@/utils/error-message";

interface UploadPph23DialogProps {
  id: string | null;
  onClose: () => void;
}

export function UploadPph23Dialog({ id, onClose }: UploadPph23DialogProps) {
  const { t } = useTranslation();
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { mutate: uploadFile, isPending } =
    useUploadNonVendorRequestFileMutation();

  // Reset file dilakukan lewat prop `key` di induk (non-vendor-requests/index.tsx:
  // key={uploadPph23Id ?? "closed"}), bukan effect. Remount menghasilkan elemen
  // <input type="file"> yang baru dan kosong, jadi reset manual fileInputRef tidak
  // diperlukan lagi, dan isDragging ikut bersih (sebelumnya tidak direset sama sekali).

  // Validasi & simpan file terpilih. Dipakai oleh klik DAN drag & drop,
  // agar validasi (PDF only, max 2MB) tidak duplikat.
  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast(<ToastError message={t("settlement.onlyPdfAllowed")} />);
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      toast(<ToastError message={t("settlement.maxSize2mb")} />);
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    handleFile(selectedFile);
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

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleUpload = () => {
    if (!id || !file) return;

    uploadFile(
      { id, type: "pph23", file },
      {
        onSuccess: () => {
          toast(<ToastSuccess message={t("settlement.submitSuccess")} />);
          setFile(null);
          onClose();
        },
        onError: (error: Error) => {
          toast(
            <ToastError
              message={
                getErrorMessage(error as AxiosError) ||
                t("settlement.submitError")
              }
            />,
          );
        },
      },
    );
  };

  return (
    <Dialog open={!!id} onOpenChange={() => !isPending && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("admin.uploadPph23")}</DialogTitle>
          <DialogDescription>
            {t("admin.selectPph23PdfDesc")}
          </DialogDescription>
        </DialogHeader>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 my-4 cursor-pointer transition-colors ${
            isDragging
              ? "border-main bg-main/10"
              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            disabled={isPending}
          />
          <div className="flex flex-col items-center space-y-2 text-center pointer-events-none">
            {file ? (
              <>
                <FileIcon className="h-10 w-10 text-primary animate-bounce" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[250px] truncate">
                  {file.name}
                </span>
                <span className="text-xs text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </>
            ) : (
              <>
                <UploadIcon className="h-10 w-10 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("admin.clickToSelectFile")}
                </span>
                <span className="text-xs text-slate-400">{t("admin.pdfUpTo2mb")}</span>
                <span className="text-xs text-slate-400">{t("common.dragDropHint")}</span>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isPending}
            className="w-full sm:w-auto gap-2"
          >
            {isPending ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>{t("common.uploading")}</span>
              </>
            ) : (
              t("common.submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
