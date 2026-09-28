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

export default getErrorMessage;
