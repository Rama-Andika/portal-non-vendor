import * as React from "react";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  CalendarIcon,
  Eye,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { InvoiceRequestItem } from "@/types/invoice.type";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { formatCurrency } from "@/utils/format-currency";
import { StatusBadge } from "@/components/status-badge";
import { settleStatusColorMap, SettleStatus } from "@/types/settlement.type";
import { InvoiceStatus } from "@/types/invoice.type";

interface UseSettlementColumnsProps {
  startIndex: number;
}

export function useSettlementColumns({
  startIndex,
}: UseSettlementColumnsProps) {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<InvoiceRequestItem>();

  const columns = React.useMemo<ColumnDef<InvoiceRequestItem, any>[]>(
    () => [
      columnHelper.display({
        id: "no",
        header: () => <DataTableColumnHeader title="No" className="pl-4" />,
        cell: (info) => (
          <span className="pl-4">{startIndex + info.row.index}</span>
        ),
        size: 60,
      }),
      columnHelper.accessor("number", {
        header: () => <DataTableColumnHeader title="Journal Number" />,
        cell: (info) => (
          <span className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("date", {
        header: () => <DataTableColumnHeader title="Date" />,
        cell: (info) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{dayjs(info.getValue()).format("DD MMM YYYY")}</span>
          </div>
        ),
      }),
      columnHelper.accessor("department", {
        header: () => <DataTableColumnHeader title="Department" />,
      }),
      columnHelper.accessor("amount", {
        header: () => <DataTableColumnHeader title="Total Invoice" />,
        cell: (info) => {
          const amount = info.getValue();
          return (
            <span className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {formatCurrency(amount)}
            </span>
          );
        },
      }),
      columnHelper.accessor("settleAmount", {
        header: () => <DataTableColumnHeader title="Settle Amount" />,
        cell: (info) => {
          const amount = info.getValue();
          if (!amount) return <span className="text-slate-400">-</span>;
          return (
            <span className="font-bold text-main whitespace-nowrap">
              {formatCurrency(amount)}
            </span>
          );
        },
      }),
      columnHelper.accessor("settleStatusLabel", {
        header: () => <DataTableColumnHeader title="Settle Status" />,
        cell: (info) => {
          const label = info.getValue();
          const status = info.row.original.settleStatus;
          
          if (status === SettleStatus.UNSETTLE || status === undefined) {
             return (
               <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none px-2 py-0.5 uppercase text-[9px] font-bold shadow-none">
                 UNSETTLE
               </Badge>
             );
          }

          return (
            <StatusBadge
              label={label || "Unknown"}
              status={status}
              colorMap={settleStatusColorMap}
            />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <DataTableColumnHeader title="Action" />,
        cell: (info) => {
          const row = info.row.original;
          const isUnsettled = row.settleStatus === SettleStatus.UNSETTLE || row.settleStatus === undefined;
          
          // Can only settle if status is CHECKED (2)
          const canSettle = isUnsettled && row.status === InvoiceStatus.CHECKED && !!row.refId && ![0, 3].includes(row.type);

          return (
            <div className="flex items-center gap-2">
              {!isUnsettled ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                >
                  <Link
                    to="/settlements/$id/detail"
                    params={{ id: row.id }}
                  >
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Link>
                </Button>
              ) : canSettle ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
                >
                  <Link
                    to="/settlements/$id/process"
                    params={{ id: row.id }}
                  >
                    <CreditCard className="w-3 h-3 mr-1" /> Process
                  </Link>
                </Button>
              ) : (
                <span className="text-[10px] text-slate-400 italic">{t("common.waitingForCheck")}</span>
              )}
            </div>
          );
        },
      }),
    ],
    [startIndex],
  );

  return { columns };
}
