import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { adminQueries } from "@/queries/admin.queries";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTablePagination } from "@/components/data-table-pagination";

// Modular Components
import { AdminUserFilters } from "./-users-modules/admin-user-filters";
import { AdminUserSkeleton } from "./-users-modules/admin-user-skeleton";
import { UpdateStatusDialog } from "./-users-modules/update-status-dialog";

// Modular Hooks
import { useAdminUserColumns } from "./-users-modules/use-admin-user-columns";
import type { NonVendorUser } from "@/types/non-vendor-user.type";
import React from "react";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/sub-heading";

const userSearchSchema = z.object({
  page: z.number().default(0),
  size: z.number().default(10),
  companyName: z.string().default(""),
  status: z.string().default(""),
  sortBy: z
    .enum(["companyName", "status", "username", "email", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

type UserSearchParams = z.infer<typeof userSearchSchema>;

export const Route = createFileRoute("/admin/users")({
  validateSearch: userSearchSchema,
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  // State untuk dialog update status
  const [selectedUser, setSelectedUser] = React.useState<NonVendorUser | null>(
    null,
  );

  // 1. Data Fetching
  const { data: response, isLoading } = useQuery(
    adminQueries.portalUsers({
      page: search.page,
      size: search.size,
      companyName: search.companyName,
      status: search.status,
      sortBy: search.sortBy,
      sortOrder: search.sortOrder,
    }),
  );

  // 2. Event Handlers
  const handleSearch = (filters: { companyName: string; status: string }) => {
    navigate({
      search: (prev) => ({
        ...prev,
        companyName: filters.companyName,
        status: filters.status === "ALL_STATUS" ? "" : filters.status,
        page: 0,
      }),
    });
  };

  const handleReset = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        companyName: "",
        status: "",
        page: 0,
      }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  };

  const handleSizeChange = (newSize: number) => {
    navigate({ search: (prev) => ({ ...prev, size: newSize, page: 0 }) });
  };

  const handleSort = (field: UserSearchParams["sortBy"]) => {
    const isCurrentField = search.sortBy === field;
    const newOrder =
      isCurrentField && search.sortOrder === "asc" ? "desc" : "asc";

    navigate({
      search: (prev) => ({
        ...prev,
        sortBy: field,
        sortOrder: newOrder,
      }),
    });
  };

  const pagination = response?.pagination;

  // 3. Columns Definition (Modular Hook)
  const { columns } = useAdminUserColumns({
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
    startIndex: pagination?.start || 0,
    onSort: handleSort,
    onUpdateStatus: setSelectedUser,
  });

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <Heading variant="admin">{t("admin.usersTitle")}</Heading>
        <SubHeading variant="admin">
          {t("admin.usersSubtitle")}
        </SubHeading>
      </div>

      {/* Filter Section (Modular Component) */}
      <AdminUserFilters
        onSearch={handleSearch}
        onReset={handleReset}
        defaultValues={{
          companyName: search.companyName || "",
          status: search.status || "ALL_STATUS",
        }}
      />

      {/* Table Section */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {isLoading ? (
            <AdminUserSkeleton columnCount={columns.length} />
          ) : (
            <div className="min-w-200 lg:min-w-full">
              <DataTable
                columns={columns as ColumnDef<NonVendorUser, any>[]}
                data={response?.data || []}
                tableOptions={{
                  manualPagination: true,
                  manualSorting: true,
                }}
              />
            </div>
          )}
        </div>

        {/* Pagination Footer (Modular Component) */}
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

      {/* Dialog Update Status */}
      <UpdateStatusDialog
        key={selectedUser?.id ?? "closed"}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
