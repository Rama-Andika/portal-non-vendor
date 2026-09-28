import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { DOCUMENT_STATUS } from "@/enums/document-status.enum";
import { AccessRestricted } from "../-components/access-restricted";
import { useQuery } from "@tanstack/react-query";
import { nonVendorQueries } from "@/queries/non-vendor.queries";
import { Loader2Icon } from "lucide-react";

export const Route = createFileRoute("/_non-vendor/invoices")({
  component: RouteComponent,
  staticData: {
    breadcrumb: "breadcrumb.invoices",
  },
});

function RouteComponent() {
  const { user: authUser } = useNonVendorAuthStore();

  // Ambil data user terbaru dari API menggunakan query
  const { data: userResponse, isLoading } = useQuery(
    nonVendorQueries.user(authUser?.id ?? ""),
  );

  const apiUser = userResponse?.data;
  const currentStatus = apiUser?.status || authUser?.status;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <Loader2Icon className="w-10 h-10 animate-spin text-main" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          Verifying access permissions...
        </p>
      </div>
    );
  }

  // Guard: hanya izinkan akses jika status APPROVED
  if (currentStatus !== DOCUMENT_STATUS.APPROVED) {
    return <AccessRestricted status={currentStatus ?? "UNKNOWN"} featureName="Invoice" />;
  }

  return <Outlet />;
}
