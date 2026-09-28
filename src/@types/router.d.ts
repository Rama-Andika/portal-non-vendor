import "@tanstack/react-router";
import type { BreadcrumbMeta } from "@/components/breadcrumb/type";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    breadcrumb?: BreadcrumbMeta;
  }
}
