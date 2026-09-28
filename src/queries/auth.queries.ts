import { useMutation } from "@tanstack/react-query";
import {
  loginNonVendor,
  registerNonVendor,
  type LoginNonVendorRequest,
} from "@/api/auth.api";
import type { RegisterNonVendorRequest } from "@/types/register.type";

export const useRegisterNonVendorMutation = () => {
  return useMutation({
    mutationFn: (payload: RegisterNonVendorRequest) =>
      registerNonVendor(payload),
  });
};

export const useLoginNonVendorMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginNonVendorRequest) =>
      loginNonVendor(payload),
  });
};
