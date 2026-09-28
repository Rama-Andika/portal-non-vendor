import { z } from "zod";

export const settlementSchema = z.object({
  settleAmount: z.number().min(1, "Settle amount must be at least 1"),
  settleNote: z.string().min(3, "Settle note must be at least 3 characters"),
  settlePaymentType: z.number().refine((val) => [0, 1, 2, 3].includes(val), {
    message: "Invalid payment type",
  }),
});

export type SettlementFormValues = z.infer<typeof settlementSchema>;
