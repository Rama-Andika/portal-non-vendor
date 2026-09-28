import * as React from "react";
import { Hexagon } from "lucide-react";

import { NavMain } from "@/components/sidebar/non-vendor/nav-main";
import { NavUser } from "@/components/sidebar/non-vendor/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { useQuery } from "@tanstack/react-query";
import { nonVendorQueries } from "@/queries/non-vendor.queries";

// This is sample data.

import { useTranslation } from "react-i18next";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { user } = useNonVendorAuthStore();

  // Fetch data from API using useQuery to get the latest company name and status
  const { data: userResponse } = useQuery(
    nonVendorQueries.user(user?.id ?? "")
  );

  const apiData = userResponse?.data;
  const companyName = apiData?.companyName || user?.companyName;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-sidebar/95 backdrop-blur supports-backdrop-filter:bg-sidebar/80 shadow-sm" {...props}>
      <SidebarHeader className="mb-4 pt-safe px-3 mt-4">
        <div className="flex items-center gap-3 overflow-hidden px-1">
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-main text-white shadow-md shadow-main/40 transition-transform group-hover/sidebar:scale-105">
            <Hexagon className="size-5 fill-current" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none transition-opacity duration-300 group-data-[collapsible=icon]/sidebar:opacity-0">
            <span className="font-bold text-lg tracking-tight text-foreground">{t("nav.portalNonVendor")}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{companyName}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 gap-1">
        <NavMain/>
      </SidebarContent>
      <SidebarFooter className="pb-safe px-2 mb-3">
        <NavUser userData={apiData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
