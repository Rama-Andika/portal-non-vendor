import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { z } from "zod";

const adminLoginSearchSchema = z.object({
  redirect: z.string().optional().catch(""),
});

import { useAdminAuthStore } from "@/stores/admin-auth.store";

export const Route = createFileRoute("/admin-login/")({
  validateSearch: (search) => adminLoginSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (useAdminAuthStore.getState().authenticated) {
      throw redirect({ to: search.redirect || "/admin/dashboard" });
    }
  },
  component: () => <AdminLoginForm />,
});
