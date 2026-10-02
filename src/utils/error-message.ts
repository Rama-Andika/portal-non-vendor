import type { TResponse } from "@/types/response.type";
import { AxiosError } from "axios";

const getErrorMessage = (error: AxiosError | undefined): string => {
  let response: TResponse<string | object> | undefined;
  if (
    error?.response?.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    response = error.response.data as TResponse<string | object>;
  } else {
    response = undefined;
  }
  let messages = "";
  if (response) {
    const { message, errors, requestId } = response;
    messages = `${message}${requestId ? `(${requestId})` : ""}`;
    if (errors) {
      if (typeof errors === "object") {
        Object.keys(errors).map(
          (key) =>
            (messages +=
              (messages.length > 0 ? ", " : "") +
              (errors as Record<string, unknown>)[key])
        );
      } else {
        messages += `, ${errors ?? ""}`;
      }
    }

    return messages;
  }
  return messages;
};

/**
 * Reads the error message from a Blob-typed response.
 *
 * Used for endpoints that use `responseType: "blob"` (file downloads).
 * Upon failure, the backend still returns JSON, but axios wraps it as a Blob.
 *
 * @returns Error message, or null if it cannot be read.
 */
export const parseBlobErrorMessage = async (
  error: unknown,
): Promise<string | null> => {
  if (!(error instanceof AxiosError)) return null;

  const data = error.response?.data;
  if (!(data instanceof Blob)) return null;

  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as { message?: string; errors?: string };
    return parsed.errors || parsed.message || null;
  } catch {
    return null;
  }
};

export default getErrorMessage;
