import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { CalendarIcon, Eye, MoreHorizontal, FileText, FilePlus } from "lucide-react";
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
import {
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_COLOR,
  type DocumentStatusType,
} from "@/enums/document-status.enum";
import type { PortalRequestItem } from "@/types/portal-request.type";
import { formatCurrency } from "@/utils/format-currency";
import { StatusBadge } from "@/components/status-badge";

const STATUS_MAP: Record<string, DocumentStatusType> = {
  DRAFT: DOCUMENT_STATUS.DRAFT,
  WAITING_APPROVAL: DOCUMENT_STATUS.PENDING,
  APPROVED: DOCUMENT_STATUS.APPROVED,
  REJECTED: DOCUMENT_STATUS.TERMINATED, // Mapping REJECTED to TERMINATED color
  CANCELLED: DOCUMENT_STATUS.CANCELLED,
};

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import dayjs from "dayjs";

interface UseInvoiceColumnsProps {
  startIndex: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (field: "date" | "amount") => void;
  onViewPph23: (filename: string) => void;
  onRequestPph23: (id: string) => void;
}

export function useInvoiceColumns({
  startIndex,
  sortBy,
  sortOrder,
  onSort,
  onViewPph23,
  onRequestPph23,
}: UseInvoiceColumnsProps) {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<PortalRequestItem>();

  const columns = React.useMemo<ColumnDef<PortalRequestItem, any>[]>(
    () => [
      columnHelper.display({
        id: "no",
        header: () => <DataTableColumnHeader title={t("columns.no")} className="pl-4" />,
        cell: (info) => (
          <span className="pl-4">{startIndex + info.row.index}</span>
        ),
        size: 60,
      }),
      columnHelper.accessor("number", {
        header: () => <DataTableColumnHeader title={t("columns.number")} />,
        cell: (info) => (
          <span className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
            {info.getValue()}
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
          <div className="flex items-center gap-2 whitespace-nowrap">
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
            <span className="font-bold text-main whitespace-nowrap">
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
                <div className="max-w-50 truncate text-slate-500 text-sm cursor-help">
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
      columnHelper.accessor("status", {
        header: () => <DataTableColumnHeader title={t("columns.status")} />,
        cell: (info) => {
          const status = info.getValue();
          const statusKey = STATUS_MAP[status] || DOCUMENT_STATUS.PENDING;
          
          const label = status
            .split("_")
            .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(" ");

          return (
            <StatusBadge
              label={label}
              status={statusKey}
              colorMap={DOCUMENT_STATUS_COLOR}
            />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <DataTableColumnHeader title={t("columns.action")} />,
        cell: (info) => {
          const row = info.row.original;
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("common.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/invoices/$id/detail" params={{ id: row.id }} className="flex items-center w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>{t("common.view")}</span>
                  </Link>
                </DropdownMenuItem>
                {row.pph23Filename && (
                  <DropdownMenuItem 
                    onClick={() => onViewPph23(row.pph23Filename!)}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{t("common.view")} PPH23</span>
                  </DropdownMenuItem>
                )}
                {row.status === DOCUMENT_STATUS.APPROVED && row.requestPph23 !== 1 && (
                  <DropdownMenuItem 
                    onClick={() => onRequestPph23(row.id)}
                    className="cursor-pointer"
                  >
                    <FilePlus className="mr-2 h-4 w-4" />
                    <span>{t("invoice.requestPph23Btn")}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [startIndex, sortBy, sortOrder, onSort, t]
  );

  return { columns };
}
