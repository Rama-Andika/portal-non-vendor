import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useImmer } from "use-immer";
import { useTranslation } from "react-i18next";
import { Save, Loader2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
  type InvoiceItemValues,
} from "@/validation/invoice-form.validation";
import { InvoiceBasicInfo } from "./invoice-basic-info";
import { InvoicePaymentInfo } from "./invoice-payment-info";
import { InvoiceLineItems } from "./invoice-line-items";
import { InvoiceSummary } from "./invoice-summary";
import { InvoiceDocuments } from "./invoice-documents";
import { InvoiceDetailFiles } from "./invoice-detail-files";
import { useDetailFileActions } from "./use-detail-file-actions";
import { useQuery } from "@tanstack/react-query";
import { nonVendorQueries } from "@/queries/non-vendor.queries";
import type { PortalRequestStatus } from "@/types/portal-request.type";
import type { StagedDocument } from "@/types/portal-request-document.type";
import type { StagedDetailFile } from "@/types/portal-request-detail-file.type";

export type InvoiceFormMode = "create" | "edit" | "view";

interface InvoiceFormProps {
  mode: InvoiceFormMode;
  requestId?: string;
  defaultValues?: Partial<InvoiceFormValues>;
  onSubmitSuccess?: (data: InvoiceFormValues) => void;
  isSubmitting?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  /** Current request status. undefined when creating a new invoice. */
  status?: PortalRequestStatus;
  /** Supporting document files not yet uploaded (staging). */
  stagedDocuments?: StagedDocument[];
  onStagedDocumentsChange?: (next: StagedDocument[]) => void;
  /** Line item (detail) files not yet uploaded (staging). */
  stagedDetailFiles?: StagedDetailFile[];
  onStagedDetailFilesChange?: (next: StagedDetailFile[]) => void;
  isAdminEdit?: boolean;
  onAdminFieldsChange?: (fields: {
    departmentId: string | null;
    requestType: number;
  }) => void;
  journalNo?: string;
}

export function InvoiceForm({
  mode,
  requestId,
  defaultValues,
  onSubmitSuccess,
  isSubmitting,
  onDirtyChange,
  status,
  stagedDocuments,
  onStagedDocumentsChange,
  stagedDetailFiles,
  onStagedDetailFilesChange,
  isAdminEdit,
  onAdminFieldsChange,
  journalNo,
}: InvoiceFormProps) {
  const isReadOnly = mode === "view";
  const { t } = useTranslation();

  // Created once here, then shared by the line item table and the
  // "Detail Files" section so both behave identically.
  const detailFileActions = useDetailFileActions({
    requestId,
    stagedDetailFiles: stagedDetailFiles ?? [],
    onStagedDetailFilesChange: onStagedDetailFilesChange ?? (() => {}),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema) as Resolver<InvoiceFormValues>,
    defaultValues: {
      departmentId: null,
      requestType: 0,
      paymentType: 2,
      bankName: "",
      beneficiaryName: "",
      accountNo: "",
      bankBranch: "",
      swiftCode: "",
      purpose: "",
      vatPercent: 0,
      vatAmount: 0,
      pphPercent: 0,
      pphAmount: 0,
      items: [],
      ...defaultValues,
    },
    values: defaultValues as InvoiceFormValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { data: deptResponse } = useQuery(nonVendorQueries.departments(2));
  const { data: currResponse } = useQuery(nonVendorQueries.currencies());
  const { data: pphTypesResponse } = useQuery(nonVendorQueries.pphTypes());

  const departments = deptResponse?.data ?? [];
  const currencies = currResponse?.data ?? [];
  const pphTypes = pphTypesResponse?.data ?? [];

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" });
  const vatPercent = useWatch({ control, name: "vatPercent" }) || 0;
  const vatAmount = useWatch({ control, name: "vatAmount" }) || 0;
  const pphPercent = useWatch({ control, name: "pphPercent" }) || 0;
  const pphAmount = useWatch({ control, name: "pphAmount" }) || 0;
  const watchedRequestType = useWatch({
    control,
    name: "requestType",
  }) as number;
  const watchedPurpose = useWatch({ control, name: "purpose" }) as string;
  const watchedDepartmentId = useWatch({
    control,
    name: "departmentId",
  }) as string;
  const watchedDate = useWatch({
    control,
    name: "date",
  }) as string;

  useEffect(() => {
    if (isAdminEdit && onAdminFieldsChange) {
      onAdminFieldsChange({
        departmentId: watchedDepartmentId ?? null,
        requestType: watchedRequestType || 0,
      });
    }
  }, [
    watchedDepartmentId,
    watchedRequestType,
    isAdminEdit,
    onAdminFieldsChange,
  ]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [tempItem, setTempItem] = useImmer<Partial<InvoiceItemValues>>({});

  const subTotal = useMemo(() => {
    return (watchedItems || []).reduce(
      (acc, item) => acc + (item.subTotal || 0),
      0,
    );
  }, [watchedItems]);

  useEffect(() => {
    if (vatPercent > 0) {
      setValue("vatAmount", Math.round((subTotal * vatPercent) / 100));
    }
  }, [subTotal, vatPercent, setValue]);

  useEffect(() => {
    if (pphPercent > 0) {
      setValue("pphAmount", Math.round((subTotal * pphPercent) / 100));
    }
  }, [subTotal, pphPercent, setValue]);

  const grandTotal = subTotal + vatAmount - pphAmount;

  const updateTempItem = (
    updater: (draft: Partial<InvoiceItemValues>) => void,
  ) => {
    setTempItem((draft) => {
      updater(draft);
      const base = (draft.price || 0) * (draft.rate || 0);
      draft.subTotal = base + (draft.vatAmount || 0) - (draft.pphAmount || 0);
    });
  };

  const handleAddItem = () => {
    if (editingIndex !== null) return;

    const newItem: InvoiceItemValues = {
      id:
        window.crypto?.randomUUID?.() ||
        Math.random().toString(36).substring(2, 9),
      description: "",
      invoiceNumber: "",
      qty: 1,
      currencyId: currencies[0]?.id ?? "",
      price: 0,
      rate: currencies[0]?.rate ?? 1,
      subTotal: 0,
      vatPercent: 0,
      vatAmount: 0,
      pphPercent: 0,
      pphAmount: 0,
      pphType: "PPH21",
    };
    append(newItem);
    setEditingIndex(fields.length);
    setTempItem(newItem);
    setIsNewItem(true);
  };

  const handleEditItem = (index: number, item: InvoiceItemValues) => {
    setEditingIndex(index);
    setTempItem(item);
    setIsNewItem(false);
  };

  const handleSaveItem = (index: number) => {
    if (!tempItem.description) return;
    update(index, tempItem as InvoiceItemValues);
    setEditingIndex(null);
    setIsNewItem(false);
  };

  const handleCancelEdit = () => {
    if (isNewItem && editingIndex !== null) {
      remove(editingIndex);
    }
    setEditingIndex(null);
    setIsNewItem(false);
  };

  const onSubmit: SubmitHandler<InvoiceFormValues> = (data) => {
    onSubmitSuccess?.(data);
  };

  const handleStatusSubmit = (status: "DRAFT" | "WAITING_APPROVAL") => {
    setValue("status", status);
    handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InvoiceBasicInfo
          register={register}
          errors={errors}
          setValue={setValue}
          isReadOnly={isReadOnly}
          watchedRequestType={watchedRequestType}
          watchedPurpose={watchedPurpose}
          watchedDepartmentId={watchedDepartmentId ?? undefined}
          watchedDate={watchedDate}
          departments={departments}
          isAdminEdit={isAdminEdit}
          journalNo={journalNo}
        />
        <InvoicePaymentInfo
          register={register}
          errors={errors}
          control={control}
          setValue={setValue}
          isReadOnly={isReadOnly}
          showBankSelector={mode === "create"}
        />
      </div>

      <InvoiceLineItems
        control={control}
        fields={fields}
        editingIndex={editingIndex}
        tempItem={tempItem}
        isReadOnly={isReadOnly}
        errors={errors}
        onAdd={handleAddItem}
        onEdit={handleEditItem}
        onSave={handleSaveItem}
        onCancel={handleCancelEdit}
        onDelete={(index) => remove(index)}
        onUpdateTemp={updateTempItem}
        currencies={currencies}
        pphTypes={pphTypes}
        requestId={requestId}
        stagedDetailFiles={stagedDetailFiles ?? []}
        detailFileActions={detailFileActions}
      />

      <InvoiceSummary
        subTotal={subTotal}
        vatPercent={vatPercent}
        vatAmount={vatAmount}
        pphPercent={pphPercent}
        pphAmount={pphAmount}
        grandTotal={grandTotal}
        onVatPercentChange={(val) => {
          setValue("vatPercent", val);
          setValue("vatAmount", Math.round((subTotal * val) / 100));
        }}
        onVatAmountChange={(val) => setValue("vatAmount", val)}
        onPphPercentChange={(val) => {
          setValue("pphPercent", val);
          setValue("pphAmount", Math.round((subTotal * val) / 100));
        }}
        onPphAmountChange={(val) => setValue("pphAmount", val)}
        isReadOnly={isReadOnly}
      >

        {/* ── Detail Files Section (above Supporting Documents, all modes) ── */}
        <InvoiceDetailFiles
          items={(watchedItems ?? []) as InvoiceItemValues[]}
          requestId={requestId}
          status={status}
          isReadOnly={isReadOnly}
          stagedDetailFiles={stagedDetailFiles ?? []}
          actions={detailFileActions}
        />

        {/* ── Supporting Documents Section (inside Total Invoice, all modes) ── */}
        <InvoiceDocuments
          requestId={requestId}
          status={status}
          isReadOnly={isReadOnly}
          stagedDocuments={stagedDocuments ?? []}
          onStagedDocumentsChange={onStagedDocumentsChange ?? (() => {})}
        />
      </InvoiceSummary>

      {/* ── Action Buttons (at the very bottom of the page) ── */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleStatusSubmit("DRAFT")}
            className="w-full sm:w-auto h-12 px-6 rounded-xl text-sm font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:shadow-md transition-all active:scale-95 group"
          >
            <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            {t("common.saveAsDraft")}
          </Button>

          {mode !== "create" && (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleStatusSubmit("WAITING_APPROVAL")}
              className="w-full sm:w-auto bg-main hover:bg-main/90 text-white h-14 px-8 rounded-xl text-md font-bold shadow-xl shadow-main/20 transition-all hover:-translate-y-0.5 active:scale-95 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <>
                    <Calculator className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    {t("invoice.submitInvoice")}
                  </>
                )}
              </span>
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
