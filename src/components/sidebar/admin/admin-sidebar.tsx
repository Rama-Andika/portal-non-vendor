import * as React from "react";
import { Shield } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AdminNavUser } from "./admin-nav-user";
import { AdminNavMain } from "./admin-nav-main";

import { useTranslation } from "react-i18next";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-sidebar/95 backdrop-blur supports-backdrop-filter:bg-sidebar/80 shadow-sm" {...props}>
      <SidebarHeader className="mb-4 pt-safe px-3 mt-4">
        <div className="flex items-center gap-3 overflow-hidden px-1">
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-destructive text-white shadow-md shadow-destructive/40 transition-transform group-hover/sidebar:scale-105">
            <Shield className="size-5 fill-current" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none transition-opacity duration-300 group-data-[collapsible=icon]/sidebar:opacity-0">
            <span className="font-bold text-lg tracking-tight text-foreground">{t("nav.adminPortal")}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("nav.systemAdministrator")}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 gap-1">
        <AdminNavMain />
      </SidebarContent>
      <SidebarFooter className="pb-safe px-2 mb-3">
        <AdminNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
