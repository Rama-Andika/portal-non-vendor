import type { CreateNonVendorRequest } from "@/types/non-vendor-request.type";
import {
  queryOptions,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { UpdateProfileFormValues } from "@/validation/update-profile.validation";
import type {
  InvoiceListParams,
  InvoiceRequestItem,
} from "@/types/invoice.type";
import type {
  PortalRequestItem,
  GetPortalRequestsParams,
  CreatePortalRequestPayload,
  UpdatePortalRequestPayload,
} from "@/types/portal-request.type";
import type { TResponse } from "@/types/response.type";
import {
  createNonVendorRequest,
  getCurrencies,
  getDepartments,
  getNonVendorRequestsList,
  getNonVendorUser,
  updateNonVendorUser,
  getNonVendorRequestDetail,
  updateNonVendorRequest,
  uploadNonVendorRequestFile,
  settleNonVendorRequest,
  getPortalRequestsList,
  createPortalRequest,
  updatePortalRequest,
  getPortalRequestDetail,
  uploadNonVendorRequestDetailFile,
  deleteNonVendorRequestDetailFile,
  patchRequestPph23,
} from "@/api/non-vendor.api";
import type {
  UpdateNonVendorRequest,
  SettleRequestPayload,
} from "@/types/non-vendor-request.type";

const NON_VENDOR_KEY = "non-vendor" as const;

export const nonVendorKeys = {
  all: [NON_VENDOR_KEY] as const,
  user: (id: string) => [NON_VENDOR_KEY, "user", id] as const,
  requests: {
    all: [NON_VENDOR_KEY, "requests"] as const,
    lists: () => [NON_VENDOR_KEY, "requests", "list"] as const,
    list: (params: InvoiceListParams) =>
      [NON_VENDOR_KEY, "requests", "list", params] as const,
    details: () => [NON_VENDOR_KEY, "requests", "detail"] as const,
    detail: (id: string) => [NON_VENDOR_KEY, "requests", "detail", id] as const,
  },
  portalRequests: {
    all: [NON_VENDOR_KEY, "portal-requests"] as const,
    lists: () => [NON_VENDOR_KEY, "portal-requests", "list"] as const,
    list: (params: GetPortalRequestsParams) =>
      [NON_VENDOR_KEY, "portal-requests", "list", params] as const,
    details: () => [NON_VENDOR_KEY, "portal-requests", "detail"] as const,
    detail: (id: string) =>
      [NON_VENDOR_KEY, "portal-requests", "detail", id] as const,
  },
  lookups: {
    departments: (level?: number) =>
      [NON_VENDOR_KEY, "lookups", "departments", { level }] as const,
    currencies: () => [NON_VENDOR_KEY, "lookups", "currencies"] as const,
  },
};

export const nonVendorQueries = {
  /**
   * Query to fetch non-vendor user profile details by ID.
   * The query only runs if `id` is not empty (enabled: !!id).
   */
  user: (id: string) =>
    queryOptions({
      queryKey: nonVendorKeys.user(id),
      queryFn: () => getNonVendorUser(id),
      staleTime: 5 * 60 * 1000, // data is considered fresh for 5 minutes
      enabled: !!id, // do not fetch if id is not available
    }),

  /**
   * Query to fetch paginated list of non-vendor requests.
   */
  requestsList: (
    params: InvoiceListParams,
    options?: Omit<
      UseQueryOptions<TResponse<InvoiceRequestItem[]>>,
      "queryKey" | "queryFn"
    >,
  ) =>
    queryOptions({
      ...options,
      queryKey: nonVendorKeys.requests.list(params),
      queryFn: () => getNonVendorRequestsList(params),
      placeholderData: keepPreviousData,
      refetchOnMount: "always",
    }),

  /**
   * Query to fetch list of departments for dropdown.
   * Stale time: 30 minutes (data jarang berubah).
   */
  departments: (level?: number) =>
    queryOptions({
      queryKey: nonVendorKeys.lookups.departments(level),
      queryFn: () => getDepartments(level),
      staleTime: 30 * 60 * 1000, // 30 menit
    }),

  /**
   * Query to fetch list of currencies for dropdown.
   * Stale time: 30 minutes (data jarang berubah).
   */
  currencies: () =>
    queryOptions({
      queryKey: nonVendorKeys.lookups.currencies(),
      queryFn: getCurrencies,
      staleTime: 30 * 60 * 1000, // 30 menit
    }),

  /**
   * Query to fetch details of a specific non-vendor request.
   */
  requestDetail: (id: string) =>
    queryOptions({
      queryKey: nonVendorKeys.requests.detail(id),
      queryFn: () => getNonVendorRequestDetail(id),
      enabled: !!id,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
    }),

  /**
   * Query to fetch paginated list of portal requests.
   */
  portalRequestsList: (
    params: GetPortalRequestsParams,
    options?: Omit<
      UseQueryOptions<TResponse<PortalRequestItem[]>>,
      "queryKey" | "queryFn"
    >,
  ) =>
    queryOptions({
      ...options,
      queryKey: nonVendorKeys.portalRequests.list(params),
      queryFn: () => getPortalRequestsList(params),
      placeholderData: keepPreviousData,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
    }),

  /**
   * Query to fetch detail of a specific portal request.
   */
  portalRequestDetail: (id: string) =>
    queryOptions({
      queryKey: nonVendorKeys.portalRequests.detail(id),
      queryFn: () => getPortalRequestDetail(id),
      enabled: !!id,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
    }),
};

/**
 * Mutation hook to update non-vendor user profile.
 * On success: invalidates the user query to refetch fresh data.
 */
export const useUpdateNonVendorUserMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileFormValues) =>
      updateNonVendorUser(userId, body),
    onSuccess: () => {
      // Invalidate query agar data user di-refetch otomatis dari server
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.user(userId),
      });
    },
  });
};

/**
 * Mutation hook to create a new non-vendor request.
 * On success: invalidates the requests list query.
 */
export const useCreateNonVendorRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateNonVendorRequest) => createNonVendorRequest(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.requests.lists(),
      });
    },
  });
};

/**
 * Mutation hook to update an existing non-vendor request.
 * On success: invalidates requests list and single request detail query.
 */
export const useUpdateNonVendorRequestMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateNonVendorRequest) =>
      updateNonVendorRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.requests.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.requests.detail(id),
      });
    },
  });
};

/**
 * Mutation hook to upload a document for a non-vendor request.
 */
export const useUploadNonVendorRequestFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      type,
      file,
    }: {
      id: string;
      type: string;
      file: File;
    }) => uploadNonVendorRequestFile(id, type, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.requests.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.lists(),
      });
    },
  });
};

/**
 * Mutation hook to process the settlement for a non-vendor request.
 */
export const useSettleNonVendorRequestMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SettleRequestPayload) =>
      settleNonVendorRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.requests.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.requests.detail(id),
      });
    },
  });
};

/**
 * Mutation hook to create a new portal request.
 */
export const useCreatePortalRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePortalRequestPayload) => createPortalRequest(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.lists(),
      });
    },
  });
};

/**
 * Mutation hook to update an existing portal request.
 */
export const useUpdatePortalRequestMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePortalRequestPayload) =>
      updatePortalRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.detail(id),
      });
    },
  });
};

/**
 * Mutation hook to upload a PDF file for a portal non-vendor request detail.
 */
export const useUploadNonVendorRequestDetailFileMutation = (portalRequestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadNonVendorRequestDetailFile(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.detail(portalRequestId),
      });
    },
  });
};

/**
 * Mutation hook to delete a PDF file for a portal non-vendor request detail.
 */
export const useDeleteNonVendorRequestDetailFileMutation = (portalRequestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNonVendorRequestDetailFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.detail(portalRequestId),
      });
    },
  });
};

/**
 * Mutation hook to request PPH23 for a portal request.
 */
export const usePatchRequestPph23Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patchRequestPph23(id, { requestPph23: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nonVendorKeys.portalRequests.lists(),
      });
    },
  });
};
