export type BreadcrumbContext = {
  params: unknown;
  search: Record<string, unknown>;
  loaderData?: unknown;
};

export type BreadcrumbMeta = string | ((context: BreadcrumbContext) => string);
