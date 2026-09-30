import { z } from "zod";
import { REQUEST_TYPE, PAYMENT_TYPE } from "@/types/portal-request.type";
import { DOCUMENT_STATUS } from "@/enums/document-status.enum";

// Schema untuk setiap detail item
export const invoiceItemSchema = z.object({
  id: z.string().optional().default(""),
  description: z
    .string()
    .min(1, "Description is required")
    .max(150, "Description cannot exceed 150 characters"),
  invoiceNumber: z
    .string()
    .max(100, "Invoice Number cannot exceed 100 characters")
    .optional()
    .default(""),
  qty: z.number().default(1),
  currencyId: z.string().min(1, "Currency is required"),
  price: z.number().min(0, "Price cannot be negative"),
  rate: z.number().min(0, "Rate cannot be negative"),
  subTotal: z.number().default(0), // computed: price * rate (hanya untuk display)
  vatPercent: z.number().min(0, "VAT percent cannot be negative").default(0),
  vatAmount: z.number().min(0, "VAT amount cannot be negative").default(0),
  pphPercent: z.number().min(0, "PPH percent cannot be negative").default(0),
  pphAmount: z.number().min(0, "PPH amount cannot be negative").default(0),
  pphType: z.string().min(1, "PPH Type is required").default("PPH21"),
  filename: z.string().nullable().optional(),
});

// Enum untuk request type
export const REQUEST_TYPE_OPTIONS = [
  { value: REQUEST_TYPE.REIMBURSEMENT, label: "Reimbursement" },
  { value: REQUEST_TYPE.PURCHASE, label: "Purchase" },
  { value: REQUEST_TYPE.ALLOWANCE_REQUEST, label: "Allowance Request" },
  { value: REQUEST_TYPE.BUDGET_REQUEST, label: "Budget Request" },
  { value: REQUEST_TYPE.BILLING_AIRPORT, label: "Billing Airport" },
  { value: REQUEST_TYPE.INTERNAL_TRANSACTION, label: "Internal Transaction" },
] as const;

// Enum untuk payment type
export const PAYMENT_TYPE_OPTIONS = [
  { value: PAYMENT_TYPE.BANK, label: "Bank" },
] as const;

// Schema utama form
export const invoiceFormSchema = z.object({
  departmentId: z.string().nullable().optional(),
  requestType: z.number().default(0),
  paymentType: z.number().default(PAYMENT_TYPE.BANK),
  bankName: z.string().min(1, "Bank Name is required"),
  beneficiaryName: z.string().min(1, "Beneficiary Name is required"),
  accountNo: z
    .string()
    .min(1, "Account Number is required")
    .regex(/^\d+$/, "Account Number must contain only digits"),
  bankBranch: z.string().min(1, "Bank Branch is required"),
  swiftCode: z.string().default(""),
  purpose: z
    .string()
    .min(1, "Purpose is required")
    .max(150, "Purpose cannot exceed 150 characters"),
  status: z
    .enum([
      DOCUMENT_STATUS.DRAFT,
      DOCUMENT_STATUS.WAITING_APPROVAL,
      DOCUMENT_STATUS.APPROVED,
      DOCUMENT_STATUS.REJECTED,
      DOCUMENT_STATUS.CANCELLED,
      DOCUMENT_STATUS.REVISION,
    ])
    .default(DOCUMENT_STATUS.DRAFT),
  date: z.string().optional(),
  vatPercent: z.number().default(0),
  vatAmount: z.number().default(0),
  pphPercent: z.number().default(0),
  pphAmount: z.number().default(0),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemValues = z.infer<typeof invoiceItemSchema>;
