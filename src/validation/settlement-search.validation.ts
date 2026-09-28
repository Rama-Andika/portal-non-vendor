import { z } from "zod";

export const settlementSearchSchema = z.object({
  page: z.number().default(0),
  size: z.number().default(10),
  sortBy: z.enum(["date", "amount"]).default("date").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  journalNumber: z.string().default("").optional(),
  startDate: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().default(() => new Date().toISOString().split("T")[0])
  ).optional(),
  endDate: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().default(() => new Date().toISOString().split("T")[0])
  ).optional(),
  settleStatus: z.number().optional(),
});

export type SettlementSearch = z.infer<typeof settlementSearchSchema>;
