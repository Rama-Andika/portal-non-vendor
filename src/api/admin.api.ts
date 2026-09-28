import axiosInstance from "./axiosInstance";
import type { TResponse } from "@/types/response.type";
import type { AdminUser } from "@/types/admin-user.type";
import type { NonVendorUser } from "@/types/non-vendor-user.type";
import type {
  InvoiceListParams,
  InvoiceRequestItem,
} from "@/types/invoice.type";

export type AdminLoginBody = {
  username: string;
  password: string;
};

/**
 * Authenticates an admin user.
 * @param body - Login credentials (username and password)
 */
export const adminLogin = async (
  body: AdminLoginBody,
): Promise<TResponse<AdminUser>> => {
  const response = await axiosInstance.post("/rest/auth/login", body);
  const result: TResponse<AdminUser> = response.data;
  return result;
};

export type AdminPortalUsersParams = {
  page: number;
  size: number;
  companyName?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/**
 * Fetches paginated list of portal non-vendor users for admin.
 */
export const getAdminPortalUsers = async (
  params: AdminPortalUsersParams,
): Promise<TResponse<NonVendorUser[]>> => {
  const { sortOrder, ...restParams } = params;
  const apiParams = {
    ...restParams,
    sortDir: sortOrder,
  };
  const response = await axiosInstance.get(
    "/rest/admin/portal/non-vendor/user",
    {
      params: apiParams,
    },
  );
  return response.data;
};

/**
 * Tipe data untuk request body update status.
 */
export type UpdateUserStatusBody = {
  status: string;
  reason?: string;
  vendorId?: string;
  isPkp?: number;
};

/**
 * Mengupdate status seorang non-vendor user.
 * @param id     - ID user yang akan diupdate
 * @param body   - { status, reason? }
 */
export const updateAdminPortalUserStatus = async (
  id: string,
  body: UpdateUserStatusBody,
): Promise<TResponse<null>> => {
  const response = await axiosInstance.patch(
    `/rest/admin/portal/non-vendor/user/${id}/status`,
    body,
  );
  return response.data;
};

/**
 * Fetches paginated list of all non-vendor requests for admin.
 */
export const getAdminNonVendorRequestsList = async (
  params: InvoiceListParams,
): Promise<TResponse<InvoiceRequestItem[]>> => {
  const response = await axiosInstance.get(
    "/rest/portal/non-vendor/requests/list",
    {
      params,
    },
  );
  return response.data;
};

export type UpdatePortalRequestStatusBody = {
  userId: string;
  status: string;
  reason?: string;
};

/**
 * Updates the status of a portal non-vendor request by admin.
 */
export const updateAdminPortalRequestStatus = async (
  id: string,
  body: UpdatePortalRequestStatusBody,
): Promise<TResponse<null>> => {
  const response = await axiosInstance.patch(
    `/rest/portal/non-vendor/portal-requests/${id}/status`,
    body,
  );
  return response.data;
};
