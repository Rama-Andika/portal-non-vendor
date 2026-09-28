import AppBreadcrumb from "@/components/breadcrumb/app-breadcrumb";
import { Footer } from "@/components/footer";
import { AppSidebar } from "@/components/sidebar/non-vendor/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";

export const Route = createFileRoute("/_non-vendor")({
  beforeLoad: async ({ location }) => {
    //const authenticated = Cookies.get("authenticated") === "true";
    if (!useNonVendorAuthStore.getState().authenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-white sticky top-0 flex min-h-16 shrink-0 items-center gap-2 border-b px-4 z-50 pt-safe pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <AppBreadcrumb />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="ghost" size="sm" />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 min-w-0 pb-safe">
          <Outlet />
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
