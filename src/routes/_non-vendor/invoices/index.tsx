import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/sub-heading";
import { Download, Plus } from "lucide-react";
import dayjs from "dayjs";
import { Spinner } from "@/components/ui/spinner";
import { convertToCsv, downloadCsv } from "@/utils/csv";
import { fetchAllPortalRequests } from "@/utils/fetch-all-portal-requests";
import { invoiceSearchSchema } from "@/validation/invoice.validation";
import { nonVendorQueries, usePatchRequestPph23Mutation } from "@/queries/non-vendor.queries";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { toast } from "sonner";
import { getNonVendorRequestFilePreview } from "@/api/non-vendor.api";

// Komponen Modular
import { InvoiceFilters } from "./-components/invoice-filters";
import { useInvoiceColumns } from "./-components/use-invoice-columns";
import { RequestPph23Dialog } from "./-components/request-pph23-dialog";
import { TableSkeleton } from "@/components/table-skeleton";
import type { PortalRequestItem, PortalRequestStatus } from "@/types/portal-request.type";

export const Route = createFileRoute("/_non-vendor/invoices/")({
  validateSearch: invoiceSearchSchema,
  component: InvoiceListPage,
});

function InvoiceListPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { user } = useNonVendorAuthStore();
  const [requestPph23Id, setRequestPph23Id] = useState<string | null>(null);
  const requestPph23Mutation = usePatchRequestPph23Mutation();
  const [isExporting, setIsExporting] = useState(false);

  // 1. Pengambilan Data
  const { data: response, isLoading } = useQuery(
    nonVendorQueries.portalRequestsList(
      {
        page: search.page,
        size: search.size,
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        number: search.number,
        startDate: search.startDate,
        endDate: search.endDate,
        status: search.status,
        portalNonVendorUserId: user?.id || "",
      },
      {
        enabled: !!user?.id,
      }
    )
  );

  const requests = response?.data || [];
  const pagination = response?.pagination;

  // 2. Penanganan Aksi
  const handleSearch = (filters: {
    number: string;
    startDate: string;
    endDate: string;
    status: PortalRequestStatus | undefined;
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
        number: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        status: undefined,
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

  const handleSort = (field: "date" | "amount") => {
    const isCurrentField = search.sortBy === field;
    const newOrder =
      isCurrentField && search.sortOrder === "asc" ? "desc" : "asc";

    navigate({
      search: (prev) => ({
        ...prev,
        sortBy: field,
        sortOrder: newOrder,
        page: 0,
      }),
      resetScroll: false,
    });
  };

  const handleViewPph23 = async (filename: string) => {
    const toastId = toast.loading(t("invoice.openingPph23File"));
    try {
      const blob = await getNonVendorRequestFilePreview(filename);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.dismiss(toastId);
    } catch (error) {
      toast.error(t("invoice.failedLoadPph23File"), { id: toastId });
    }
  };

  const handleExportCsv = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const allRequests = await fetchAllPortalRequests({
        page: search.page,
        size: search.size,
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        number: search.number,
        startDate: search.startDate,
        endDate: search.endDate,
        status: search.status,
        portalNonVendorUserId: user?.id || "",
      });

      const headers = [
        t("columns.no"),
        t("columns.number"),
        t("columns.date"),
        t("common.total"),
        t("columns.purpose"),
        t("columns.status"),
      ];

      const rows = allRequests.map((item, index) => [
        index + 1,
        item.number,
        dayjs(item.date).format("YYYY-MM-DD"),
        item.amount,
        item.purpose || "",
        item.status,
      ]);

      const csv = convertToCsv(headers, rows);

      const today = dayjs().format("YYYY-MM-DD");
      downloadCsv(csv, `invoices_${today}.csv`);

      toast.success(t("invoice.exportSuccess"));
    } catch {
      toast.error(t("invoice.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Definisi Kolom
  const { columns } = useInvoiceColumns({
    startIndex: pagination?.start || 0,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
    onSort: handleSort,
    onViewPph23: handleViewPph23,
    onRequestPph23: (id) => setRequestPph23Id(id),
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden animate-in fade-in duration-500">
      {/* Bagian Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Heading>{t("invoice.title")}</Heading>
          <SubHeading>{t("invoice.subtitle")}</SubHeading>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleExportCsv}
            disabled={isExporting}
            variant="outline"
            className="w-full sm:w-auto px-6 h-10 rounded-xl shrink-0"
          >
            {isExporting ? (
              <>
                <Spinner className="w-4 h-4" /> {t("invoice.exporting")}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> {t("invoice.exportCsv")}
              </>
            )}
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto bg-main hover:bg-main/90 text-white shadow-lg transition-all active:scale-95 px-6 h-10 rounded-xl shrink-0"
          >
            <Link to="/invoices/new">
              <Plus className="w-4 h-4 mr-2" /> {t("invoice.newInvoice")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Bagian Filter */}
      <InvoiceFilters
        onSearch={handleSearch}
        onReset={handleReset}
        defaultValues={{
          number: search.number || "",
          startDate: search.startDate || "",
          endDate: search.endDate || "",
          status: search.status,
        }}
      />

      {/* Bagian Tabel */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <TableSkeleton columnCount={columns.length} />
          ) : (
            <div className="min-w-200 w-full">
              <DataTable
                columns={columns as ColumnDef<PortalRequestItem, any>[]}
                data={requests}
                tableOptions={{
                  manualPagination: true,
                  manualSorting: true,
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Paginasi */}
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
      <RequestPph23Dialog
        isOpen={!!requestPph23Id}
        onClose={() => setRequestPph23Id(null)}
        onConfirm={() => {
          if (requestPph23Id) {
            requestPph23Mutation.mutate(requestPph23Id, {
              onSuccess: () => {
                toast.success(t("invoice.pph23RequestSuccess"));
                setRequestPph23Id(null);
              },
              onError: (error) => {
                toast.error(error.message || t("invoice.pph23RequestError"));
              },
            });
          }
        }}
        isLoading={requestPph23Mutation.isPending}
      />
    </div>
  );
}
