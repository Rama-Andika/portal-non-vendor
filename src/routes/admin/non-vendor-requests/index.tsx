import * as React from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/sub-heading";
import { adminInvoiceSearchSchema } from "@/validation/admin-invoice.validation";
import type { ColumnDef } from "@tanstack/react-table";
import type { PortalRequestItem, PortalRequestStatus } from "@/types/portal-request.type";
import { toast } from "sonner";
import ToastError from "@/components/toast/toast-error";
import { getNonVendorRequestFilePreview } from "@/api/non-vendor.api";

// Modular Components
import { AdminInvoiceFilters } from "./-components/admin-invoice-filters";
import { useAdminInvoiceColumns } from "./-components/use-admin-invoice-columns";
import { AdminInvoiceTableSkeleton } from "./-components/admin-invoice-skeleton";
import { UpdateStatusDialog } from "./-components/update-status-dialog";
import { UploadPph23Dialog } from "./-components/upload-pph23-dialog";
import { nonVendorQueries } from "@/queries/non-vendor.queries";

export const Route = createFileRoute("/admin/non-vendor-requests/")({
  validateSearch: adminInvoiceSearchSchema,
  component: AdminInvoiceListPage,
});

function AdminInvoiceListPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // 1. Data Fetching
  const { data: response, isLoading } = useQuery(
    nonVendorQueries.portalRequestsList({
      page: search.page,
      size: search.size,
      sortBy: search.sortBy,
      sortOrder: search.sortOrder,
      number: search.journalNumber,
      startDate: search.startDate,
      endDate: search.endDate,
      status: search.status,
      companyName: search.companyName,
      portalNonVendorUserId: search.portalNonVendorUserId,
    }),
  );

  const requests = response?.data || [];
  const pagination = response?.pagination;

  // 2. Event Handlers
  const handleSearch = (filters: {
    journalNumber: string;
    startDate: string;
    endDate: string;
    status: PortalRequestStatus | undefined;
    companyName: string;
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
        startDate: "",
        endDate: "",
        status: undefined,
        companyName: "",
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

  const [selectedRequest, setSelectedRequest] = React.useState<{
    id: string;
    status?: string;
  } | null>(null);

  const [uploadPph23Id, setUploadPph23Id] = React.useState<string | null>(null);

  const handleView = (id: string) => {
    navigate({
      to: "/admin/non-vendor-requests/$id/detail",
      params: { id },
    });
  };

  const handleViewPph23 = async (filename: string) => {
    try {
      toast.loading(t("admin.loadingDocumentPreview"), { id: "preview-loading" });
      const blob = await getNonVendorRequestFilePreview(filename);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.dismiss("preview-loading");
    } catch (error) {
      toast.dismiss("preview-loading");
      toast(<ToastError message={t("admin.failedLoadDocumentPreview")} />);
    }
  };

  // 3. Columns Definition
  const { columns } = useAdminInvoiceColumns({
    startIndex: pagination?.start || 0,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
    onSort: handleSort,
    onView: handleView,
    onUpdateStatus: (id, status) => setSelectedRequest({ id, status }),
    onUploadPph23: (id) => setUploadPph23Id(id),
    onViewPph23: handleViewPph23,
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-full overflow-hidden animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <Heading variant="admin">{t("admin.requestsTitle")}</Heading>
          <SubHeading variant="admin">
            {t("admin.requestsSubtitle")}
          </SubHeading>
        </div>
      </div>

      {/* Filter Section */}
      <AdminInvoiceFilters
        onSearch={handleSearch}
        onReset={handleReset}
        defaultValues={{
          journalNumber: search.journalNumber || "",
          startDate: search.startDate || "",
          endDate: search.endDate || "",
          status: search.status,
          companyName: search.companyName || "",
        }}
      />

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <AdminInvoiceTableSkeleton columnCount={columns.length} />
          ) : (
            <div className="min-w-250 w-full">
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

      <UpdateStatusDialog
        id={selectedRequest?.id || null}
        currentStatus={selectedRequest?.status}
        onClose={() => setSelectedRequest(null)}
      />

      <UploadPph23Dialog
        id={uploadPph23Id}
        onClose={() => setUploadPph23Id(null)}
      />
    </div>
  );
}
