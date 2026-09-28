import { z } from "zod";
import {
  bankItemSchema,
  type BankItemFormValue,
} from "./bank.validation";

export { bankItemSchema, type BankItemFormValue };


export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    companyName: z.string().min(1, "Company name is required"),
    companyType: z.enum(["PT", "CV", "Firma", "UD", "Individual", "Others"], {
      message: "Company type is required",
    }),
    otherCompanyType: z.string().optional(),
    address: z.string().min(5, "Address is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City/Regency is required"),
    postalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits"),
    phoneNumber: z
      .string()
      .min(8, "Invalid phone number")
      .max(15, "Invalid phone number"),
    website: z
      .string()
      .url("Invalid website format")
      .optional()
      .or(z.literal("")),
    banks: z
      .array(bankItemSchema)
      .min(1, "At least 1 bank details is required")
      .max(2, "Maximum 2 bank details allowed"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.companyType === "Others") {
        return !!data.otherCompanyType && data.otherCompanyType.length > 0;
      }
      return true;
    },
    {
      message: "Please specify other company type",
      path: ["otherCompanyType"],
    },
  )
  .refine(
    (data) => {
      const primaryCount = data.banks.filter((b) => b.isPrimary === 1).length;
      return primaryCount === 1;
    },
    {
      message: "Exactly one primary bank must be selected",
      path: ["banks"],
    },
  );

export type SignUpFormValues = z.infer<typeof signUpSchema>;

