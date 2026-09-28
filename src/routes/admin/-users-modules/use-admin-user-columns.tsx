import * as React from "react";
import { format } from "date-fns";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { MoreHorizontalIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_COLOR,
} from "@/enums/document-status.enum";
import type { NonVendorUser } from "@/types/non-vendor-user.type";

import { DataTableColumnHeader } from "@/components/data-table-column-header";

interface UseAdminUserColumnsProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  startIndex: number;
  onSort: (field: any) => void;
  onUpdateStatus: (user: NonVendorUser) => void;
}

export function useAdminUserColumns({
  sortBy,
  sortOrder,
  startIndex,
  onSort,
  onUpdateStatus,
}: UseAdminUserColumnsProps) {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<NonVendorUser>();

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "no",
        header: () => (
          <DataTableColumnHeader title={t("columns.no")} className="pl-4" />
        ),
        cell: ({ row }) => (
          <span className="pl-4 text-sm font-medium text-slate-500">
            {startIndex + row.index}
          </span>
        ),
        size: 50,
      }),
      columnHelper.accessor("username", {
        header: () => (
          <DataTableColumnHeader
            title={t("columns.username")}
            field="username"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
            className="-ml-4"
          />
        ),
      }),
      columnHelper.accessor("email", {
        header: () => (
          <DataTableColumnHeader
            title={t("columns.email")}
            field="email"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          />
        ),
      }),
      columnHelper.accessor("companyName", {
        header: () => (
          <DataTableColumnHeader
            title={t("columns.companyName")}
            field="companyName"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          />
        ),
      }),
      columnHelper.accessor("status", {
        header: () => (
          <DataTableColumnHeader
            title={t("columns.status")}
            field="status"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          />
        ),

        cell: ({ row }) => {
          const status = row.original.status as keyof typeof DOCUMENT_STATUS;
          const colors = DOCUMENT_STATUS_COLOR[status] || {
            bg: "#f3f4f6",
            text: "#374151",
          };
          return (
            <Badge
              style={{ backgroundColor: colors.bg, color: colors.text }}
              className="font-semibold shadow-none border-none"
            >
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: () => (
          <DataTableColumnHeader
            title={t("columns.createdAt")}
            field="createdAt"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={onSort}
          />
        ),
        cell: ({ row }) =>
          format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm"),
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          <DataTableColumnHeader title={t("columns.action")} className="pl-3" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          const isApproved = user.status === DOCUMENT_STATUS.APPROVED;
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 data-[state=open]:bg-muted"
                >
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">{t("common.openActionsMenu")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {user.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(user)}
                  disabled={isApproved}
                  className="cursor-pointer"
                >
                  <PencilIcon className="size-4 mr-2" />
                  {t("admin.updateUserStatus")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [sortBy, sortOrder, startIndex, onSort, onUpdateStatus, t],
  );

  return { columns };
}
