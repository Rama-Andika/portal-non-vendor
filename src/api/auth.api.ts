import type { RegisterNonVendorRequest } from "@/types/register.type";
import type { TResponse } from "@/types/response.type";
import type { NonVendorUser } from "@/types/non-vendor-user.type";
import axios from "axios";

const host = import.meta.env.VITE_API_URL ?? "";

export const registerNonVendor = async (
  payload: RegisterNonVendorRequest,
): Promise<TResponse<null>> => {
  const response = await axios.post(
    `${host}/rest/portal/non-vendor/register`,
    payload,
  );
  return response.data;
};

export type LoginNonVendorRequest = {
  username: string;
  password: string;
};

export type LoginAdminRequest = {
  username: string;
  password: string;
};

export const loginNonVendor = async (
  payload: LoginNonVendorRequest,
): Promise<TResponse<NonVendorUser>> => {
  const response = await axios.post(
    `${host}/rest/portal/non-vendor/login`,
    payload,
  );
  return response.data;
};

