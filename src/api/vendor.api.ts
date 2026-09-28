import axiosInstance from "./axiosInstance";
import type { VendorSearchResponse } from "@/types/vendor.type";

/**
 * Searches for vendors by code or name.
 * @param keyword - Search keyword (vendor code/name)
 */
export const searchVendor = async (
  keyword: string,
): Promise<VendorSearchResponse> => {
  const response = await axiosInstance.get<VendorSearchResponse>(
    `/rest/general/vendor/${encodeURIComponent(keyword)}`,
  );
  return response.data;
};
