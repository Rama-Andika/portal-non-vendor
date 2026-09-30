import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { FieldArrayWithId } from "react-hook-form";
import { Check, X, Edit2, Trash2, Paperclip, Eye, Loader2, FileX } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CharacterCountTextarea } from "@/components/ui/character-count-textarea";
import SelectReact, { type TSelectOption } from "@/components/ui/SelectReact";
import type {
  InvoiceFormValues,
  InvoiceItemValues,
} from "@/validation/invoice-form.validation";
import { formatNumberWithDecimals } from "@/utils/format-number";
import { toValidNumber } from "@/utils/to-valid-number";
import { cn } from "@/lib/utils";
import type { Currency } from "@/types/currency.type";
import type { PphType } from "@/types/portal-request.type";
import { toast } from "sonner";
import ToastError from "@/components/toast/toast-error";
import ToastSuccess from "@/components/toast/toast-success";
import {
  useUploadNonVendorRequestDetailFileMutation,
  useDeleteNonVendorRequestDetailFileMutation,
} from "@/queries/non-vendor.queries";
import { getNonVendorRequestDetailFilePreview } from "@/api/non-vendor.api";
interface InvoiceLineItemRowProps {
  field: FieldArrayWithId<InvoiceFormValues, "items">;
  index: number;
  isEditing: boolean;
  isReadOnly?: boolean;
  tempItem: Partial<InvoiceItemValues>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onUpdateTemp: (updater: (draft: Partial<InvoiceItemValues>) => void) => void;
  currencies: Currency[];
  pphTypes: PphType[];
  requestId?: string;
  dbId?: string;
  filename?: string | null;
}

export function InvoiceLineItemRow({
  field,
  index,
  isEditing,
  isReadOnly,
  tempItem,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onUpdateTemp,
  currencies,
  pphTypes,
  requestId,
  dbId,
  filename,
}: InvoiceLineItemRowProps) {
  const { t } = useTranslation();
  // Local display states for BUG-3 fix
  const [displayAmount, setDisplayAmount] = useState("");
  const [displayRate, setDisplayRate] = useState("");
  const [displayVatPercent, setDisplayVatPercent] = useState("");
  const [displayPphPercent, setDisplayPphPercent] = useState("");
  const [displayVatAmount, setDisplayVatAmount] = useState("");
  const [displayPphAmount, setDisplayPphAmount] = useState("");
  const [memoError, setMemoError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const { mutate: uploadFile, isPending: isUploading } =
    useUploadNonVendorRequestDetailFileMutation(requestId || "");

  const { mutate: deleteFile, isPending: isDeleting } =
    useDeleteNonVendorRequestDetailFileMutation(requestId || "");

  const currentDbId = isEditing ? tempItem.id : dbId;
  const currentFilename = isEditing ? tempItem.filename : filename;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast(<ToastError message={t("settlement.onlyPdfAllowed")} />);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast(<ToastError message={t("settlement.maxSize2mb")} />);
      return;
    }

    if (!currentDbId) {
      toast(
        <ToastError message={t("invoice.detailIdNotFound")} />,
      );
      return;
    }

    uploadFile(
      { id: currentDbId, file },
      {
        onError: () => {
          toast(<ToastError message={t("invoice.uploadFailedSome")} />);
        },
      },
    );
  };

  const handlePreview = async (fname: string) => {
    try {
      setIsPreviewLoading(true);
      toast.loading(t("admin.loadingDocumentPreview"), { id: "preview-loading" });
      const blob = await getNonVendorRequestDetailFilePreview(fname);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.dismiss("preview-loading");
    } catch {
      toast.dismiss("preview-loading");
      toast(<ToastError message={t("admin.failedLoadDocumentPreview")} />);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDeleteFile = () => {
    if (!currentDbId) return;

    toast.loading(t("common.loading"), { id: "delete-loading" });
    deleteFile(currentDbId, {
      onSuccess: () => {
        toast.dismiss("delete-loading");
        toast(<ToastSuccess message={t("invoice.fileDeletedSuccess")} />);
      },
      onError: () => {
        toast.dismiss("delete-loading");
        toast(<ToastError message={t("invoice.failedDeleteFile")} />);
      },
    });
  };

  // Keep the latest tempItem in a ref so the sync effect below can read it
  // without depending on every field (depending on them would disrupt typing).
  const tempItemRef = useRef(tempItem);
  useEffect(() => {
    tempItemRef.current = tempItem;
  }, [tempItem]);

  // Sync display states when entering edit mode or when the item changes
  useEffect(() => {
    if (isEditing) {
      const latest = tempItemRef.current;
      setDisplayAmount(latest.price != null ? String(latest.price) : "");
      setDisplayRate(latest.rate != null ? String(latest.rate) : "");
      setDisplayVatPercent(
        latest.vatPercent != null ? String(latest.vatPercent) : "",
      );
      setDisplayPphPercent(
        latest.pphPercent != null ? String(latest.pphPercent) : "",
      );
      setDisplayVatAmount(
        latest.vatAmount != null
          ? formatNumberWithDecimals(latest.vatAmount)
          : "",
      );
      setDisplayPphAmount(
        latest.pphAmount != null
          ? formatNumberWithDecimals(latest.pphAmount)
          : "",
      );
    }
  }, [isEditing, tempItem.id]);

  const handleBlurAmount = () =>
    setDisplayAmount(formatNumberWithDecimals(tempItem.price || 0));
  const handleBlurRate = () =>
    setDisplayRate(formatNumberWithDecimals(tempItem.rate || 0));

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayAmount(e.target.value);
    onUpdateTemp((draft) => {
      const newPrice = toValidNumber(e.target.value);
      draft.price = newPrice;

      const base = newPrice * (draft.rate || 0);
      draft.vatAmount = Math.round((base * (draft.vatPercent || 0)) / 100);
      draft.pphAmount = Math.round((base * (draft.pphPercent || 0)) / 100);

      setDisplayVatAmount(formatNumberWithDecimals(draft.vatAmount));
      setDisplayPphAmount(formatNumberWithDecimals(draft.pphAmount));
    });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayRate(e.target.value);
    onUpdateTemp((draft) => {
      const newRate = toValidNumber(e.target.value);
      draft.rate = newRate;

      const base = (draft.price || 0) * newRate;
      draft.vatAmount = Math.round((base * (draft.vatPercent || 0)) / 100);
      draft.pphAmount = Math.round((base * (draft.pphPercent || 0)) / 100);

      setDisplayVatAmount(formatNumberWithDecimals(draft.vatAmount));
      setDisplayPphAmount(formatNumberWithDecimals(draft.pphAmount));
    });
  };

  const handleVatPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayVatPercent(e.target.value);
    onUpdateTemp((draft) => {
      const percent = toValidNumber(e.target.value);
      draft.vatPercent = percent;
      const base = (draft.price || 0) * (draft.rate || 0);
      const amount = Math.round((base * percent) / 100);
      draft.vatAmount = amount;
      setDisplayVatAmount(formatNumberWithDecimals(amount));
    });
  };

  const handleVatAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayVatAmount(e.target.value);
    onUpdateTemp((draft) => {
      const amount = toValidNumber(e.target.value);
      draft.vatAmount = amount;
      const base = (draft.price || 0) * (draft.rate || 0);
      if (base > 0) {
        const percent = Number(((amount / base) * 100).toFixed(2));
        draft.vatPercent = percent;
        setDisplayVatPercent(String(percent));
      }
    });
  };

  const handlePphPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayPphPercent(e.target.value);
    onUpdateTemp((draft) => {
      const percent = toValidNumber(e.target.value);
      draft.pphPercent = percent;
      const base = (draft.price || 0) * (draft.rate || 0);
      const amount = Math.round((base * percent) / 100);
      draft.pphAmount = amount;
      setDisplayPphAmount(formatNumberWithDecimals(amount));
    });
  };

  const handlePphAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayPphAmount(e.target.value);
    onUpdateTemp((draft) => {
      const amount = toValidNumber(e.target.value);
      draft.pphAmount = amount;
      const base = (draft.price || 0) * (draft.rate || 0);
      if (base > 0) {
        const percent = Number(((amount / base) * 100).toFixed(2));
        draft.pphPercent = percent;
        setDisplayPphPercent(String(percent));
      }
    });
  };

  if (!isEditing) {
    return (
      <TableRow className="group transition-colors border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
        <TableCell className="px-4 py-5 text-slate-400 font-mono text-xs align-top pt-8">
          {index + 1}
        </TableCell>
        <TableCell className="px-4 py-5 align-top pt-8">
          <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {field.description || "—"}
          </div>
        </TableCell>
        <TableCell className="px-4 py-5 align-top pt-8">
          <div className="font-medium text-slate-600 dark:text-slate-300 wrap-break-word">
            {field.invoiceNumber || "—"}
          </div>
        </TableCell>

        <TableCell className="px-4 py-5 align-top pt-7 text-center">
          <span className="inline-block px-2 py-1 rounded-lg bg-main/10 text-main text-[10px] font-semibold uppercase tracking-widest">
            {currencies.find((c) => c.id === field.currencyId)?.currencyCode ||
              field.currencyId}
          </span>
        </TableCell>
        <TableCell className="px-4 py-5 text-right align-top pt-7 font-semibold text-slate-600 dark:text-slate-400">
          {formatNumberWithDecimals(field.price || 0)}
        </TableCell>
        <TableCell className="px-4 py-5 text-right align-top pt-7 text-slate-400 text-sm italic">
          x {formatNumberWithDecimals(field.rate || 1)}
        </TableCell>
        <TableCell className="px-4 py-5 text-right align-top pt-7 font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex flex-col text-right">
            <span>{field.vatPercent || 0}%</span>
            <span className="text-xs text-slate-400 font-normal">
              Rp {formatNumberWithDecimals(field.vatAmount || 0)}
            </span>
          </div>
        </TableCell>
        <TableCell className="px-4 py-5 text-center align-top pt-7">
          <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-widest">
            {pphTypes.find((p) => p.code === field.pphType)?.label ||
              field.pphType ||
              "—"}
          </span>
        </TableCell>
        <TableCell className="px-4 py-5 text-right align-top pt-7 font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex flex-col text-right">
            <span>{field.pphPercent || 0}%</span>
            <span className="text-xs text-slate-400 font-normal">
              Rp {formatNumberWithDecimals(field.pphAmount || 0)}
            </span>
          </div>
        </TableCell>
        <TableCell className="px-4 py-5 text-right font-bold text-main text-lg align-top pt-7">
          {formatNumberWithDecimals(field.subTotal || 0)}
        </TableCell>
        <TableCell className="px-4 py-5 align-top pt-6 text-center">
          <div className="flex items-center justify-center gap-1.5 min-h-9">
            {currentFilename ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isPreviewLoading}
                onClick={() => handlePreview(currentFilename)}
                className="h-8 text-slate-400 hover:text-main hover:bg-main/5 rounded-lg px-2 text-xs flex items-center gap-1 transition-all"
                title={t("invoice.viewPdf")}
              >
                {isPreviewLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </Button>
            ) : null}

            {/* Upload Button */}
            {!isReadOnly && currentDbId && requestId && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-slate-400 hover:text-main hover:bg-main/5 rounded-lg px-2 text-xs flex items-center gap-1 transition-all"
                  title={currentFilename ? t("invoice.changePdf") : t("invoice.uploadPdfMax2mb")}
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5" />
                  )}
                </Button>
              </>
            )}

            {/* Delete Button */}
            {!isReadOnly && currentDbId && requestId && currentFilename && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isDeleting || isUploading}
                onClick={handleDeleteFile}
                className="h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg px-2 text-xs flex items-center gap-1 transition-all"
                title={t("invoice.deletePdf")}
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileX className="w-3.5 h-3.5" />
                )}
              </Button>
            )}

            {!currentFilename && (isReadOnly || !currentDbId || !requestId) && (
              <span className="text-xs text-slate-400 font-normal select-none">
                —
              </span>
            )}
          </div>
        </TableCell>
        {!isReadOnly && (
          <TableCell className="px-4 py-5 align-top pt-7 text-center">
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onEdit}
                className="h-9 w-9 text-slate-400 hover:text-main hover:bg-main/5 rounded-xl transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onDelete}
                className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  }

  return (
    <TableRow className="bg-main/3 dark:bg-main/[0.07] border-slate-100 dark:border-slate-800/50">
      <TableCell className="px-4 py-5 text-slate-400 font-mono text-xs align-top pt-8">
        {index + 1}
      </TableCell>
      <TableCell className="px-4 py-5 align-top">
        <CharacterCountTextarea
          value={tempItem.description}
          onChange={(e) => {
            onUpdateTemp((draft) => {
              draft.description = e.target.value;
            });
            if (memoError && e.target.value.trim()) setMemoError(false);
          }}
          placeholder={t("invoice.itemDetailsPlaceholder")}
          className={cn(
            "min-h-25 rounded-xl border-slate-200 bg-white resize-none shadow-sm focus:ring-main/20 focus:border-main text-sm",
            memoError && "border-red-500 ring-red-500/10",
          )}
          maxLength={150}
          autoFocus
        />
        {memoError && (
          <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">
            {t("invoice.descriptionRequired")}
          </p>
        )}
      </TableCell>
      <TableCell className="px-4 py-5 align-top">
        <Input
          type="text"
          value={tempItem.invoiceNumber || ""}
          onChange={(e) => {
            onUpdateTemp((draft) => {
              draft.invoiceNumber = e.target.value;
            });
          }}
          placeholder={t("invoice.itemInvoiceNoPlaceholder")}
          className="rounded-xl border-slate-200 bg-white shadow-sm focus:ring-main/20 focus:border-main text-sm w-full min-w-30"
        />
      </TableCell>

      <TableCell className="px-4 py-5 align-top pt-7 text-center">
        <SelectReact
          options={currencies.map((c) => ({
            value: c.id,
            label: c.currencyCode,
          }))}
          value={
            currencies.find((c) => c.id === tempItem.currencyId)
              ? {
                  value: tempItem.currencyId,
                  label: currencies.find((c) => c.id === tempItem.currencyId)
                    ?.currencyCode as string,
                }
              : null
          }
          onChange={(val) => {
            const option = val as TSelectOption | null;
            if (!option) return;
            const selected = currencies.find((c) => c.id === option.value);
            onUpdateTemp((draft) => {
              draft.currencyId = option.value as string;
              draft.rate = selected?.rate ?? 1;
              setDisplayRate(String(selected?.rate ?? 1));
            });
          }}
          className=" min-w-25"
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
        />
      </TableCell>
      <TableCell className="px-4 py-5 text-right align-top pt-7">
        <Input
          type="text"
          value={displayAmount}
          onChange={handlePriceChange}
          onBlur={handleBlurAmount}
          className=" rounded-xl text-right font-semibold w-32 ml-auto"
        />
      </TableCell>
      <TableCell className="px-4 py-5 text-right align-top pt-7">
        <Input
          type="text"
          value={displayRate}
          onChange={handleRateChange}
          onBlur={handleBlurRate}
          className=" rounded-xl text-right font-semibold w-24 ml-auto"
        />
      </TableCell>
      <TableCell className="px-4 py-5 text-right align-top">
        <div className="flex flex-col gap-2 w-28 ml-auto">
          <div className="relative group">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">
              %
            </div>
            <Input
              type="text"
              value={displayVatPercent}
              onChange={handleVatPercentChange}
              placeholder="0"
              className="rounded-xl text-right font-semibold pr-6 h-9 w-full text-xs shadow-sm focus:ring-main/20 focus:border-main"
            />
          </div>
          <div className="relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">
              Rp
            </div>
            <Input
              type="text"
              value={displayVatAmount}
              onChange={handleVatAmountChange}
              onBlur={() =>
                setDisplayVatAmount(
                  formatNumberWithDecimals(tempItem.vatAmount || 0),
                )
              }
              placeholder="0"
              className="rounded-xl text-right font-semibold pl-6 pr-2 h-9 w-full text-xs shadow-sm focus:ring-main/20 focus:border-main"
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-5 align-top pt-7 text-center">
        <SelectReact
          options={pphTypes.map((p) => ({
            value: p.code,
            label: p.label,
          }))}
          value={
            pphTypes.find((p) => p.code === tempItem.pphType)
              ? {
                  value: tempItem.pphType as string,
                  label: pphTypes.find((p) => p.code === tempItem.pphType)
                    ?.label as string,
                }
              : null
          }
          onChange={(val) => {
            const option = val as TSelectOption | null;
            if (!option) return;
            onUpdateTemp((draft) => {
              draft.pphType = option.value as string;
            });
          }}
          className="min-w-30"
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
        />
      </TableCell>
      <TableCell className="px-4 py-5 text-right align-top">
        <div className="flex flex-col gap-2 w-28 ml-auto">
          <div className="relative group">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">
              %
            </div>
            <Input
              type="text"
              value={displayPphPercent}
              onChange={handlePphPercentChange}
              placeholder="0"
              className="rounded-xl text-right font-semibold pr-6 h-9 w-full text-xs shadow-sm focus:ring-main/20 focus:border-main"
            />
          </div>
          <div className="relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-300">
              Rp
            </div>
            <Input
              type="text"
              value={displayPphAmount}
              onChange={handlePphAmountChange}
              onBlur={() =>
                setDisplayPphAmount(
                  formatNumberWithDecimals(tempItem.pphAmount || 0),
                )
              }
              placeholder="0"
              className="rounded-xl text-right font-semibold pl-6 pr-2 h-9 w-full text-xs shadow-sm focus:ring-main/20 focus:border-main"
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-5 text-right font-bold text-main text-lg align-top pt-7">
        {formatNumberWithDecimals(tempItem.subTotal || 0)}
      </TableCell>
      <TableCell className="px-4 py-5 align-top pt-6 text-center">
        <div className="flex items-center justify-center gap-1.5 min-h-9">
          {currentFilename ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPreviewLoading}
              onClick={() => handlePreview(currentFilename)}
              className="h-8 text-slate-400 hover:text-main hover:bg-main/5 rounded-lg px-2 text-xs flex items-center gap-1 transition-all"
              title={t("invoice.viewPdf")}
            >
              {isPreviewLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </Button>
          ) : null}

          {/* Upload Button */}
          {!isReadOnly && currentDbId && requestId && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-slate-400 hover:text-main hover:bg-main/5 rounded-lg px-2 text-xs flex items-center gap-1 transition-all"
                title={currentFilename ? t("invoice.changePdf") : t("invoice.uploadPdfMax2mb")}
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Paperclip className="w-3.5 h-3.5" />
                )}
              </Button>
            </>
          )}

          {/* Delete Button */}
          {!isReadOnly && currentDbId && requestId && currentFilename && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isDeleting || isUploading}
              onClick={handleDeleteFile}
              className="h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg px-2 text-xs flex items-center gap-1 transition-all"
              title={t("invoice.deletePdf")}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileX className="w-3.5 h-3.5" />
              )}
            </Button>
          )}

          {!currentFilename && (isReadOnly || !currentDbId || !requestId) && (
            <span className="text-xs text-slate-400 font-normal select-none">
              —
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="px-4 py-5 align-top pt-7 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            size="icon"
            onClick={() => {
              if (!tempItem.description?.trim()) {
                setMemoError(true);
                return;
              }
              setMemoError(false);
              onSave();
            }}
            className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/10"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onCancel}
            className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
