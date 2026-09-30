import { type FieldArrayWithId, type FieldErrors, type Control, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, LayoutList } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import FieldError from "@/components/field-error";
import type { InvoiceFormValues, InvoiceItemValues } from "@/validation/invoice-form.validation";
import { InvoiceLineItemRow } from "./invoice-line-item-row";
import { cn } from "@/lib/utils";
import type { Currency } from "@/types/currency.type";
import type { PphType } from "@/types/portal-request.type";

interface InvoiceLineItemsProps {
  control: Control<InvoiceFormValues>;
  fields: FieldArrayWithId<InvoiceFormValues, "items">[];
  editingIndex: number | null;
  tempItem: Partial<InvoiceItemValues>;
  isReadOnly?: boolean;
  errors: FieldErrors<InvoiceFormValues>;
  onAdd: () => void;
  onEdit: (index: number, item: InvoiceItemValues) => void;
  onSave: (index: number) => void;
  onCancel: () => void;
  onDelete: (index: number) => void;
  onUpdateTemp: (updater: (draft: Partial<InvoiceItemValues>) => void) => void;
  currencies: Currency[];
  pphTypes: PphType[];
  requestId?: string;
}

export function InvoiceLineItems({
  control,
  fields,
  editingIndex,
  tempItem,
  isReadOnly,
  errors,
  onAdd,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onUpdateTemp,
  currencies,
  pphTypes,
  requestId,
}: InvoiceLineItemsProps) {
  const { t } = useTranslation();
  const watchedItems = useWatch({ control, name: "items" }) || [];

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 lg:px-8 flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-main/10 flex items-center justify-center text-main shrink-0">
            <LayoutList className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs">{t("invoice.lineItems")}</h3>
        </div>
        {!isReadOnly && (
          <Button 
            type="button"
            onClick={onAdd}
            disabled={editingIndex !== null}
            variant="outline"
            className={cn(
              "h-10 border-main text-main hover:bg-main hover:text-white rounded-xl font-semibold px-5 transition-all shadow-sm",
              editingIndex !== null && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4 mr-2" /> {t("invoice.addItem")}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <Table className="min-w-215">
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-12 px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">#</TableHead>
              <TableHead className="min-w-50 px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.description")}</TableHead>
              <TableHead className="min-w-37.5 px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.number")}</TableHead>
              <TableHead className="w-24 px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.currency")}</TableHead>
              <TableHead className="w-36 px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.price")}</TableHead>
              <TableHead className="w-24 px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.rate")}</TableHead>
              <TableHead className="w-32 px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.vat")}</TableHead>
              <TableHead className="w-28 px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.pphType")}</TableHead>
              <TableHead className="w-32 px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.pph")}</TableHead>
              <TableHead className="w-36 px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.subAmount")}</TableHead>
              <TableHead className="w-28 px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("invoice.file")}</TableHead>
              {!isReadOnly && <TableHead className="w-24 px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t("common.action")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <InvoiceLineItemRow 
                key={field.id}
                field={field}
                index={index}
                isEditing={editingIndex === index}
                isReadOnly={isReadOnly}
                tempItem={tempItem}
                onEdit={() => onEdit(index, watchedItems[index] as InvoiceItemValues)}
                onSave={() => onSave(index)}
                onCancel={onCancel}
                onDelete={() => onDelete(index)}
                onUpdateTemp={onUpdateTemp}
                currencies={currencies}
                pphTypes={pphTypes}
                requestId={requestId}
                dbId={watchedItems[index]?.id}
                filename={watchedItems[index]?.filename}
              />
            ))}
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={isReadOnly ? 11 : 12} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <LayoutList className="w-12 h-12 mb-2" />
                    <p className="text-sm italic font-medium">{t("invoice.addAtLeastOneItem")}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {errors.items && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border-t border-red-100 dark:border-red-500/20">
          <FieldError>{errors.items.message}</FieldError>
        </div>
      )}
    </div>
  );
}
