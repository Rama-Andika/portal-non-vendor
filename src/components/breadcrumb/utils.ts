// components/breadcrumb/utils.ts
import type { BreadcrumbMeta, BreadcrumbContext } from "./type";
import type { AnyRouteMatch } from "@tanstack/react-router";

export function resolveBreadcrumb(
  meta: BreadcrumbMeta | undefined,
  match: AnyRouteMatch
): string | null {
  if (!meta) return null;

  if (typeof meta === "string") return meta;

  const context: BreadcrumbContext = {
    params: match.params,
    search: match.search,
    loaderData: match.loaderData,
  };

  return meta(context);
}
