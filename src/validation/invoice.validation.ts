import { z } from "zod";
import { PORTAL_REQUEST_STATUS_VALUES } from "@/types/portal-request.type";

export const portalRequestStatusEnum = z.enum(PORTAL_REQUEST_STATUS_VALUES);

export const invoiceSearchSchema = z.object({
  page: z.number().catch(0).default(0),
  size: z.number().catch(20).default(20),
  sortBy: z.enum(["date", "amount"]).default("date").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  number: z.string().default("").optional(),
  startDate: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().default(() => new Date().toISOString().split("T")[0])
  ).optional(),
  endDate: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().default(() => new Date().toISOString().split("T")[0])
  ).optional(),
  status: portalRequestStatusEnum.optional(),
});

export type InvoiceSearch = z.infer<typeof invoiceSearchSchema>;
