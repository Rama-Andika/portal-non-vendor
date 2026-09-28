import * as React from "react";
import { useTranslation } from "react-i18next";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  CalendarIcon,
  Eye,
  MoreHorizontal,
  CheckCircle,
  FileUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_STATUS_COLOR } from "@/enums/document-status.enum";
import type {
  PortalRequestItem,
  PortalRequestStatus,
} from "@/types/portal-request.type";
import { formatCurrency } from "@/utils/format-currency";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import dayjs from "dayjs";

interface UseAdminInvoiceColumnsProps {
  startIndex: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (field: "date" | "amount") => void;
  onView: (id: string) => void;
  onUpdateStatus: (id: string, status: PortalRequestStatus) => void;
  onUploadPph23: (id: string) => void;
  onViewPph23: (filename: string) => void;
}

export function useAdminInvoiceColumns({
  startIndex,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onUpdateStatus,
  onUploadPph23,
  onViewPph23,
}: UseAdminInvoiceColumnsProps) {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<PortalRequestItem>();

  const columns = React.useMemo<ColumnDef<PortalRequestItem, any>[]>(
    () => [
      columnHelper.display({
        id: "no",
        header: () => <DataTableColumnHeader title={t("columns.no")} className="pl-4" />,
        cell: (info) => (
          <span className="pl-4 text-[13px] text-slate-500 font-medium">
            {startIndex + info.row.index}
          </span>
        ),
        size: 60,
      }),
      columnHelper.accessor("portalNonVendorCompanyName", {
        header: () => <DataTableColumnHeader title={t("columns.companyName")} />,
        cell: (info) => (
          <span className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap text-[13px]">
            {info.getValue() || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("number", {
        header: () => <DataTableColumnHeader title={t("columns.number")} />,
        cell: (info) => (
          <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-[13px]">
            {info.getValue() || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("bankpoPaymentNumber", {
        header: () => <DataTableColumnHeader title={t("columns.prNo")} />,
        cell: (info) => (
          <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap text-[13px]">
            {info.getValue() || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("date", {
        header: () => (
          <DataTableColumnHeader
            title={t("columns.date")}
            field="date"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          />
        ),
        cell: (info) => (
          <div className="flex items-center gap-2 whitespace-nowrap text-[13px]">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{dayjs(info.getValue()).format("DD MMM YYYY")}</span>
          </div>
        ),
      }),
      columnHelper.accessor("amount", {
        header: () => (
          <DataTableColumnHeader
            title={t("common.total")}
            field="amount"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          />
        ),
        cell: (info) => {
          const amount = info.getValue();
          return (
            <span className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap text-[13px]">
              {formatCurrency(amount)}
            </span>
          );
        },
      }),
      columnHelper.accessor("purpose", {
        header: () => <DataTableColumnHeader title={t("columns.purpose")} />,
        cell: (info) => {
          const purpose = info.getValue() || "-";
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-37.5 truncate text-slate-500 text-[13px] cursor-help">
                  {purpose}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-75">
                {purpose}
              </TooltipContent>
            </Tooltip>
          );
        },
      }),
      columnHelper.accessor("requestPph23", {
        header: () => <DataTableColumnHeader title={t("columns.settlementBuktiPotong")} />,
        cell: (info) => {
          const row = info.row.original;
          const isRequested = row.requestPph23 === 1;
          const hasFile = !!row.pph23Filename;

          if (isRequested && hasFile) {
            return (
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 border-none shadow-none text-[11px] font-semibold py-0.5 px-2">
                {t("admin.completed")}
              </Badge>
            );
          }

          if (isRequested && !hasFile) {
            return (
              <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 border-none shadow-none text-[11px] font-semibold py-0.5 px-2">
                {t("admin.requested")}
              </Badge>
            );
          }

          return (
            <span className="text-slate-400 dark:text-slate-600 pl-2 text-[13px]">—</span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: () => <DataTableColumnHeader title={t("columns.status")} />,
        cell: (info) => {
          const status = info.getValue() || "PENDING";
          const colors = DOCUMENT_STATUS_COLOR[
            status as keyof typeof DOCUMENT_STATUS_COLOR
          ] || {
            bg: "#f3f4f6",
            text: "#374151",
          };

          return (
            <Badge
              style={{ backgroundColor: colors.bg, color: colors.text }}
              className="px-2 py-0.5 uppercase text-[9px] font-bold shadow-none border-none"
            >
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <DataTableColumnHeader title={t("columns.action")} />,
        cell: (info) => (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg">
              <DropdownMenuItem
                onClick={() => onView?.(info.row.original.id)}
                className="cursor-pointer gap-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg"
              >
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                {t("admin.viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus?.(info.row.original.id, info.row.original.status as PortalRequestStatus)}
                className="cursor-pointer gap-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg"
              >
                <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
                {t("admin.updateStatus")}
              </DropdownMenuItem>
              {info.row.original.requestPph23 === 1 && (
                <DropdownMenuItem
                  onClick={() => onUploadPph23?.(info.row.original.id)}
                  className="cursor-pointer gap-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  <FileUp className="h-3.5 w-3.5 text-slate-400" />
                  {t("admin.uploadPph23")}
                </DropdownMenuItem>
              )}
              {info.row.original.pph23Filename && (
                <DropdownMenuItem
                  onClick={() => onViewPph23?.(info.row.original.pph23Filename!)}
                  className="cursor-pointer gap-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  {t("admin.viewPph23")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [startIndex, sortBy, sortOrder, onSort, onView, onUpdateStatus, onUploadPph23, onViewPph23, t],
  );

  return { columns };
}
