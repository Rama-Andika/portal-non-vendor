import { LoginForm } from "@/components/login-form";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, string>) => {
    const redirect =
      search.redirect && search.redirect.length > 0
        ? search.redirect
        : "/company";
    return {
      redirect: redirect,
    };
  },
  beforeLoad: ({ search }) => {
    if (useNonVendorAuthStore.getState().authenticated) {
      throw redirect({ to: search.redirect });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid min-h-svh ">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
