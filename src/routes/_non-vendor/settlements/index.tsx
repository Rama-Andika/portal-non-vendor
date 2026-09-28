import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/sub-heading";
import { settlementSearchSchema } from "@/validation/settlement-search.validation";
import type { ColumnDef } from "@tanstack/react-table";
import { type InvoiceRequestItem, InvoiceStatus } from "@/types/invoice.type";
import { Info } from "lucide-react";

// Modular Components
import { useSettlementColumns } from "./-components/use-settlement-columns";
import { TableSkeleton } from "@/components/table-skeleton";
import { SettlementFilters } from "./-components/settlement-filters";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { nonVendorQueries } from "@/queries/non-vendor.queries";

export const Route = createFileRoute("/_non-vendor/settlements/")({
  validateSearch: settlementSearchSchema,
  component: SettlementListPage,
});

function SettlementListPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { user } = useNonVendorAuthStore();

  // 1. Data Fetching
  const { data: response, isLoading } = useQuery(
    nonVendorQueries.requestsList(
      {
        page: search.page,
        size: search.size,
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        journalNumber: search.journalNumber,
        startDate: search.startDate,
        endDate: search.endDate,
        // Force status to CHECKED (2) as requested
        status: InvoiceStatus.CHECKED,
        portalNonVendorUserId: user?.id || undefined,
      },
      {
        enabled: !!user?.id,
      },
    ),
  );

  const settlements = response?.data || [];
  const pagination = response?.pagination;

  // 2. Event Handlers
  const handleSearch = (filters: {
    journalNumber: string;
    startDate: string;
    endDate: string;
  }) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...filters,
        page: 0,
      }),
      resetScroll: false,
    });
  };

  const handleReset = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        journalNumber: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        page: 0,
      }),
      resetScroll: false,
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
      resetScroll: false,
    });
  };

  const handleSizeChange = (newSize: number) => {
    navigate({
      search: (prev) => ({ ...prev, size: newSize, page: 0 }),
      resetScroll: false,
    });
  };

  // 3. Columns Definition
  const { columns } = useSettlementColumns({
    startIndex: pagination?.start || 0,
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Heading>{t("settlement.title")}</Heading>
          <SubHeading>{t("settlement.subtitle")}</SubHeading>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-in slide-in-from-right-4 duration-500">
          <Info size={16} className="shrink-0" />
          <span className="text-xs font-medium">{t("settlement.checkedOnlyInfo")}</span>
        </div>
      </div>

      {/* Filter Section */}
      <SettlementFilters
        onSearch={handleSearch}
        onReset={handleReset}
        defaultValues={{
          journalNumber: search.journalNumber || "",
          startDate: search.startDate || "",
          endDate: search.endDate || "",
        }}
      />

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <TableSkeleton columnCount={columns.length} />
          ) : (
            <div className="min-w-200 w-full">
              <DataTable
                columns={columns as ColumnDef<InvoiceRequestItem, any>[]}
                data={settlements}
                tableOptions={{
                  manualPagination: true,
                  manualSorting: true,
                }}
              />
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="border-t bg-muted/10 px-4 md:px-6">
          <DataTablePagination
            page={search.page}
            size={search.size}
            totalPages={pagination?.totalPages || 0}
            onPageChange={handlePageChange}
            onSizeChange={handleSizeChange}
          />
        </div>
      </div>
    </div>
  );
}
