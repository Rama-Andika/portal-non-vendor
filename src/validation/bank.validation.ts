import { z } from "zod";

export const bankItemSchema = z.object({
  beneficiaryName: z.string().min(1, "Beneficiary name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z
    .string()
    .min(1, "Account number is required")
    .regex(/^\d+$/, "Account number must contain only digits"),
  branch: z.string().min(1, "Branch name is required"),
  swiftCode: z.string().optional().or(z.literal("")),
  isPrimary: z.number(),
});

export type BankItemFormValue = z.infer<typeof bankItemSchema>;
