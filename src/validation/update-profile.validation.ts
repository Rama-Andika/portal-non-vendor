import { z } from "zod";
import { bankItemSchema } from "./bank.validation";

export const updateProfileSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    companyName: z.string().min(1, "Company name is required"),
    companyType: z.enum(["PT", "CV", "Firma", "UD", "Individual", "Others"], {
      message: "Company type is required",
    }),
    otherCompanyType: z.string().optional(),
    address: z.string().min(5, "Address must be at least 5 characters"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City / Regency is required"),
    postalCode: z
      .string()
      .regex(/^\d{5}$/, "Postal code must be 5 digits"),
    phoneNumber: z
      .string()
      .min(8, "Phone number is too short")
      .max(15, "Phone number is too long"),
    website: z
      .string()
      .url("Invalid website URL format")
      .optional()
      .or(z.literal("")), // allow empty string
    banks: z
      .array(bankItemSchema)
      .min(1, "At least 1 bank details is required")
      .max(2, "Maximum 2 bank details allowed"),
  })
  .refine(
    (data) => {
      // otherCompanyType wajib diisi hanya jika companyType adalah "Others"
      if (data.companyType === "Others") {
        return !!data.otherCompanyType && data.otherCompanyType.length > 0;
      }
      return true;
    },
    {
      message: "Please specify other company type",
      path: ["otherCompanyType"],
    }
  )
  .refine(
    (data) => {
      const primaryCount = data.banks.filter((b) => Number(b.isPrimary) === 1).length;
      return primaryCount === 1;
    },
    {
      message: "Exactly one primary bank must be selected",
      path: ["banks"],
    }
  );

// Type yang diinfer dari schema, dipakai di komponen dan API function
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
