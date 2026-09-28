import { createFileRoute, redirect } from "@tanstack/react-router";

import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: () => {
    if (useAdminAuthStore.getState().authenticated) {
      throw redirect({ to: "/admin/dashboard" });
    }
    if (!useNonVendorAuthStore.getState().authenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/company",
        },
      });
    }
  },
});

function RouteComponent() {
  return <div>Hello "/"!</div>;
}
