import { Building2Icon, FileTextIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";

export function NavMain() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuSubItem>
        <SidebarMenuButton tooltip={t("nav.companyProfile")} asChild>
          <Link
            to="/company"
            className="[&.active]:font-bold [&.active]:text-main"
            onClick={() => {
              isMobile && toggleSidebar();
            }}
          >
            <Building2Icon />
            <span>{t("nav.companyProfile")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        <SidebarMenuButton tooltip={t("nav.invoices")} asChild>
          <Link
            to="/invoices"
            className="[&.active]:font-bold [&.active]:text-main"
            onClick={() => {
              isMobile && toggleSidebar();
            }}
          >
            <FileTextIcon />
            <span>{t("nav.invoices")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuSubItem>
      {/* <SidebarMenuSubItem>
        <SidebarMenuButton tooltip="Settlements" asChild>
          <Link
            to="/settlements"
            className="[&.active]:font-bold [&.active]:text-main"
            onClick={() => {
              isMobile && toggleSidebar();
            }}
          >
            <BanknoteIcon />
            <span>Settlements</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuSubItem> */}
    </SidebarMenu>
    // <SidebarMenu>
    //   {items.map((item) =>
    //     item.items.length > 0 ? (
    //       <Collapsible
    //         key={item.title}
    //         asChild
    //         defaultOpen={item.isActive || href.includes(item.url)}
    //         className="group/collapsible"
    //       >
    //         <SidebarMenuItem>
    //           <CollapsibleTrigger asChild>
    //             <SidebarMenuButton tooltip={item.title}>
    //               {item.icon && <item.icon />}
    //               <span>{item.title}</span>
    //               <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
    //             </SidebarMenuButton>
    //           </CollapsibleTrigger>
    //           <CollapsibleContent>
    //             <SidebarMenuSub>
    //               {item.items?.map((subItem) => (
    //                 <SidebarMenuSubItem key={subItem.title}>
    //                   <SidebarMenuSubButton asChild>
    //                     <Link
    //                       to={subItem.url}
    //                       className="[&.active]:font-bold [&.active]:text-main"
    //                       activeOptions={{
    //                         exact: subItem?.exact ?? false,
    //                         includeSearch: false,
    //                       }}
    //                       onClick={() => {
    //                         isMobile && toggleSidebar();
    //                       }}
    //                     >
    //                       <span>{subItem.title}</span>
    //                     </Link>
    //                   </SidebarMenuSubButton>
    //                 </SidebarMenuSubItem>
    //               ))}
    //             </SidebarMenuSub>
    //           </CollapsibleContent>
    //         </SidebarMenuItem>
    //       </Collapsible>
    //     ) : (
    //       <SidebarMenuSubItem key={item.title}>
    //         <SidebarMenuButton tooltip={item.title} asChild>
    //           <Link
    //             to={item.url}
    //             className="[&.active]:font-bold [&.active]:text-main"
    //             onClick={() => {
    //               isMobile && toggleSidebar();
    //             }}
    //           >
    //             {item.icon && <item.icon />}
    //             <span>{item.title}</span>
    //           </Link>
    //         </SidebarMenuButton>
    //       </SidebarMenuSubItem>
    //     ),
    //   )}
    // </SidebarMenu>
  );
}
