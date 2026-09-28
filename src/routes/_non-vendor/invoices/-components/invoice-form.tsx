import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useImmer } from "use-immer";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
  type InvoiceItemValues,
} from "@/validation/invoice-form.validation";
import { InvoiceBasicInfo } from "./invoice-basic-info";
import { InvoicePaymentInfo } from "./invoice-payment-info";
import { InvoiceLineItems } from "./invoice-line-items";
import { InvoiceSummary } from "./invoice-summary";
import { InvoiceAttachments } from "./invoice-attachments";
import { useQuery } from "@tanstack/react-query";
import { nonVendorQueries } from "@/queries/non-vendor.queries";

export type InvoiceFormMode = "create" | "edit" | "view";

interface InvoiceFormProps {
  mode: InvoiceFormMode;
  requestId?: string;
  defaultValues?: Partial<InvoiceFormValues>;
  onSubmitSuccess?: (data: InvoiceFormValues) => void;
  isSubmitting?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  existingFiles?: {
    invoice_path?: string | null;
    faktur_pajak_path?: string | null;
    approval_doc_path?: string | null;
  };
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
  existingFiles,
  isAdminEdit,
  onAdminFieldsChange,
  journalNo,
}: InvoiceFormProps) {
  const isReadOnly = mode === "view";

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

  const departments = deptResponse?.data ?? [];
  const currencies = currResponse?.data ?? [];

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" }) || [];
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
    return watchedItems.reduce((acc, item) => acc + (item.subTotal || 0), 0);
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
          isReadOnly={isReadOnly}
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
        requestId={requestId}
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
        isSubmitting={isSubmitting}
        onStatusSubmit={(status: "DRAFT" | "WAITING_APPROVAL") => {
          setValue("status", status);
          handleSubmit(onSubmit)();
        }}
        mode={mode}
      />

      {/* ── Attachment Section ── */}
      {mode !== "create" && (
        <InvoiceAttachments
          requestId={requestId}
          isReadOnly={isReadOnly}
          existingFiles={existingFiles}
        />
      )}
    </form>
  );
}
