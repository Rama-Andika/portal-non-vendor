import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/non-vendor-requests")({
  component: () => <Outlet />,
  staticData: {
    breadcrumb: "breadcrumb.nonVendorRequests",
  },
});
