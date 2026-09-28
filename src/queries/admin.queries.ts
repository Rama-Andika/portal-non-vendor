import {
  useMutation,
  queryOptions,
  keepPreviousData,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  adminLogin,
  getAdminPortalUsers,
  getAdminNonVendorRequestsList,
  updateAdminPortalRequestStatus,
} from "@/api/admin.api";
import type {
  AdminLoginBody,
  AdminPortalUsersParams,
  UpdatePortalRequestStatusBody,
} from "@/api/admin.api";
import type {
  InvoiceListParams,
  InvoiceRequestItem,
} from "@/types/invoice.type";
import type { TResponse } from "@/types/response.type";

const ADMIN_KEY = "admin" as const;

export const adminKeys = {
  all: [ADMIN_KEY] as const,
  portalUsers: {
    all: [ADMIN_KEY, "portal-users"] as const,
    lists: () => [ADMIN_KEY, "portal-users", "list"] as const,
    list: (params: AdminPortalUsersParams) =>
      [ADMIN_KEY, "portal-users", "list", params] as const,
  },
  nonVendorRequests: {
    all: [ADMIN_KEY, "non-vendor-requests"] as const,
    lists: () => [ADMIN_KEY, "non-vendor-requests", "list"] as const,
    list: (params: InvoiceListParams) =>
      [ADMIN_KEY, "non-vendor-requests", "list", params] as const,
  },
};

/**
 * Mutation hook for admin login.
 * Delegates the actual API call; the component handles onSuccess/onError.
 */
export const useAdminLoginMutation = () => {
  return useMutation({
    mutationFn: (body: AdminLoginBody) => adminLogin(body),
  });
};

/**
 * Mutation hook for updating admin portal request status.
 */
export const useUpdateAdminPortalRequestStatusMutation = () => {
  return useMutation<
    Awaited<ReturnType<typeof updateAdminPortalRequestStatus>>,
    AxiosError,
    { id: string; body: UpdatePortalRequestStatusBody }
  >({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdatePortalRequestStatusBody;
    }) => updateAdminPortalRequestStatus(id, body),
  });
};

export const adminQueries = {
  portalUsers: (params: AdminPortalUsersParams) =>
    queryOptions({
      queryKey: adminKeys.portalUsers.list(params),
      queryFn: () => getAdminPortalUsers(params),
      placeholderData: keepPreviousData,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
    }),

  /**
   * Query to fetch all non-vendor requests for admin.
   */
  nonVendorRequestsList: (
    params: InvoiceListParams,
    options?: Omit<
      UseQueryOptions<TResponse<InvoiceRequestItem[]>>,
      "queryKey" | "queryFn"
    >,
  ) =>
    queryOptions({
      ...options,
      queryKey: adminKeys.nonVendorRequests.list(params),
      queryFn: () => getAdminNonVendorRequestsList(params),
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: "always",
      refetchOnMount: "always",
    }),
};
