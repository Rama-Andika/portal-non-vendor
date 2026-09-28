import { queryOptions } from "@tanstack/react-query";
import { searchVendor } from "@/api/vendor.api";

const VENDOR_KEY = "vendor" as const;

export const vendorKeys = {
  all: [VENDOR_KEY] as const,
  search: (keyword: string) => [VENDOR_KEY, "search", keyword] as const,
};

export const vendorQueries = {
  /**
   * Query to search vendors by keyword.
   * Only runs when the keyword is not empty (enabled).
   */
  search: (keyword: string) =>
    queryOptions({
      queryKey: vendorKeys.search(keyword),
      queryFn: () => searchVendor(keyword),
      enabled: keyword.trim().length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 0,
    }),
};
