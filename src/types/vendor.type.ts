import type { TResponse } from "./response.type";

/**
 * Vendor data returned by the general endpoint.
 */
export interface Vendor {
  vendorId: string;
  code: string;
  name: string;
  isPkp: 0 | 1; // 0 = non-PKP, 1 = PKP
}

export type VendorSearchResponse = TResponse<Vendor[]>;
