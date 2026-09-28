import { useMatches, Link, type AnyRouteMatch } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { resolveBreadcrumb } from "./utils";

const AppBreadcrumb = () => {
  const { t } = useTranslation();
  const matches = useMatches();

  // Ambil hanya route yang punya breadcrumb
  const crumbs = matches
    .map((match: AnyRouteMatch) => {
      const label = resolveBreadcrumb(match.staticData?.breadcrumb, match);

      if (!label) return null;

      return {
        label: t(label as any, { defaultValue: label }),
        to: match.pathname,
      };
    })
    .filter(Boolean) as { label: string; to: string }[];

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <div key={crumb.to} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
