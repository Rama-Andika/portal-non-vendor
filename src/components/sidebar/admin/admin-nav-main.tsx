import { UsersIcon, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdminNavMain() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuSubItem>
        <SidebarMenuButton tooltip={t("nav.users")} asChild>
          <Link
            to="/admin/users"
            className="[&.active]:font-bold [&.active]:text-main"
            onClick={() => {
              isMobile && toggleSidebar();
            }}
          >
            <UsersIcon />
            <span>{t("nav.users")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuSubItem>

      <SidebarMenuSubItem>
        <SidebarMenuButton tooltip={t("nav.nonVendorRequests")} asChild>
          <Link
            to="/admin/non-vendor-requests"
            className="[&.active]:font-bold [&.active]:text-main"
            onClick={() => {
              isMobile && toggleSidebar();
            }}
          >
            <FileText />
            <span>{t("nav.nonVendorRequests")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuSubItem>
    </SidebarMenu>
  );
}
