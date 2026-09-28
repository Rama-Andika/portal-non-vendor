import type { NonVendorUser } from "@/types/non-vendor-user.type";
import type { TResponse } from "@/types/response.type";
import axiosInstance from "./axiosInstance";
import type { UpdateProfileFormValues } from "@/validation/update-profile.validation";
import type {
  InvoiceListParams,
  InvoiceRequestItem,
} from "@/types/invoice.type";
import type { Department } from "@/types/department.type";
import type { Currency } from "@/types/currency.type";
import type {
  CreateNonVendorRequest,
  NonVendorRequestResponse,
  SettleRequestPayload,
  UpdateNonVendorRequest,
} from "@/types/non-vendor-request.type";
import type {
  PortalRequestItem,
  GetPortalRequestsParams,
  CreatePortalRequestPayload,
  UpdatePortalRequestPayload,
  PortalRequestDetailResponse,
  RequestPph23Payload,
} from "@/types/portal-request.type";

/**
 * Creates a new portal request for non-vendor.
 */
export const createPortalRequest = async (
  body: CreatePortalRequestPayload,
): Promise<TResponse<string>> => {
  const response = await axiosInstance.post(
    "/rest/portal/non-vendor/portal-requests",
    body,
  );
  return response.data;
};

/**
 * Updates an existing portal request for non-vendor.
 */
export const updatePortalRequest = async (
  id: string,
  body: UpdatePortalRequestPayload,
): Promise<TResponse<unknown>> => {
  const response = await axiosInstance.put(
    `/rest/portal/non-vendor/portal-requests/${id}`,
    body,
  );
  return response.data;
};

/**
 * Sends a patch request to ask for PPH23.
 */
export const patchRequestPph23 = async (
  id: string,
  payload: RequestPph23Payload,
): Promise<TResponse<null>> => {
  const response = await axiosInstance.patch(
    `/rest/portal/non-vendor/portal-requests/${id}/request-pph23`,
    payload,
  );
  return response.data;
};

/**
 * Fetches detail of a specific portal request.
 */
export const getPortalRequestDetail = async (
  id: string,
): Promise<TResponse<PortalRequestDetailResponse>> => {
  const response = await axiosInstance.get(
    `/rest/portal/non-vendor/portal-requests/${id}`,
  );
  return response.data;
};

/**
 * Fetches paginated list of portal requests for non-vendor.
 */
export const getPortalRequestsList = async (
  params: GetPortalRequestsParams,
): Promise<TResponse<PortalRequestItem[]>> => {
  const response = await axiosInstance.get(
    "/rest/portal/non-vendor/portal-requests/list",
    {
      params,
    },
  );
  return response.data;
};

/**
 * Fetches portal non-vendor user profile data based on ID.
 * @param id - The ID of the user whose data is to be fetched
 */
export const getNonVendorUser = async (
  id: string,
): Promise<TResponse<NonVendorUser>> => {
  const response = await axiosInstance.get("/rest/portal/non-vendor/user", {
    params: { id },
  });
  const result: TResponse<NonVendorUser> = response.data;
  return result;
};

/**
 * Updates portal non-vendor user profile data based on ID.
 * Only allowed when the user's current status is REVISION.
 * After a successful update, the status is reset to PENDING by the server.
 * @param id    - The ID of the user to update
 * @param body  - The request body conforming to UpdateProfileFormValues
 */
export const updateNonVendorUser = async (
  id: string,
  body: UpdateProfileFormValues,
): Promise<TResponse<NonVendorUser>> => {
  const response = await axiosInstance.put(
    "/rest/portal/non-vendor/user",
    body,
    {
      params: { id },
    },
  );
  const result: TResponse<NonVendorUser> = response.data;
  return result;
};

/**
 * Fetches paginated list of non-vendor requests.
 */
export const getNonVendorRequestsList = async (
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

/**
 * Fetches list of departments for dropdown.
 * @param level - Filter by department level (optional)
 */
export const getDepartments = async (
  level?: number,
): Promise<TResponse<Department[]>> => {
  const response = await axiosInstance.get("/rest/departments", {
    params: { level },
  });
  return response.data;
};

/**
 * Fetches list of currencies for dropdown.
 */
export const getCurrencies = async (): Promise<TResponse<Currency[]>> => {
  const response = await axiosInstance.get("/rest/currencies");
  return response.data;
};

/**
 * Creates a new non-vendor request.
 */
export const createNonVendorRequest = async (
  body: CreateNonVendorRequest,
): Promise<TResponse<string>> => {
  const response = await axiosInstance.post(
    "/rest/portal/non-vendor/requests/new",
    body,
  );
  return response.data;
};

/**
 * Fetches detail of a specific non-vendor request.
 */
export const getNonVendorRequestDetail = async (
  id: string,
): Promise<TResponse<NonVendorRequestResponse>> => {
  const response = await axiosInstance.get(
    `/rest/portal/non-vendor/requests/${id}`,
  );
  return response.data;
};

/**
 * Updates an existing non-vendor request.
 */
export const updateNonVendorRequest = async (
  id: string,
  body: UpdateNonVendorRequest,
): Promise<TResponse<unknown>> => {
  const response = await axiosInstance.put(
    `/rest/portal/non-vendor/requests/${id}/update`,
    body,
  );
  return response.data;
};

/**
 * Uploads a file associated with a non-vendor request.
 */
export const uploadNonVendorRequestFile = async (
  id: string,
  type: string,
  file: File,
): Promise<TResponse<unknown>> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post(
    `/rest/portal/non-vendor/upload/${id}/${type}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};



/**
 * Fetches the document preview from the server.
 */
export const getNonVendorRequestFilePreview = async (
  filename: string,
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/rest/portal/non-vendor/file-preview/${filename}`,
    {
      params: { t: new Date().getTime() },
      responseType: "blob",
    },
  );
  return response.data;
};

/**
 * Fetches the detail document preview from the server for invoice line items.
 */
export const getNonVendorRequestDetailFilePreview = async (
  filename: string,
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/rest/portal/non-vendor/detail/file-preview/${filename}`,
    {
      responseType: "blob",
    },
  );
  return response.data;
};




/**
 * Processes the settlement for a checked non-vendor request.
 */
export const settleNonVendorRequest = async (
  id: string,
  body: SettleRequestPayload,
): Promise<TResponse<unknown>> => {
  const response = await axiosInstance.patch(
    `/rest/portal/non-vendor/requests/${id}/settlement`,
    body,
  );
  return response.data;
};

/**
 * Uploads a file associated with a portal non-vendor request detail.
 */
export const uploadNonVendorRequestDetailFile = async (
  id: string,
  file: File,
): Promise<TResponse<string>> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<TResponse<string>>(
    `/rest/portal/non-vendor/detail/upload/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

/**
 * Deletes a PDF file associated with a portal non-vendor request detail.
 */
export const deleteNonVendorRequestDetailFile = async (
  id: string,
): Promise<TResponse<void>> => {
  const response = await axiosInstance.delete<TResponse<void>>(
    `/rest/portal/non-vendor/detail/filename/${id}`,
  );
  return response.data;
};
