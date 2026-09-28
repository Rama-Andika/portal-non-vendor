import { z } from "zod";
import { portalRequestStatusEnum } from "./invoice.validation";

export const adminInvoiceSearchSchema = z.object({
  page: z.number().default(0),
  size: z.number().default(10),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  journalNumber: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  status: portalRequestStatusEnum.optional(),
  companyName: z.string().default(""),
  portalNonVendorUserId: z.string().default(""),
});

export type AdminInvoiceSearch = z.infer<typeof adminInvoiceSearchSchema>;
