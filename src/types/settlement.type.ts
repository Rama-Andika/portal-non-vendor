// --- Settlement Status ---
export const SettleStatus = {
  UNSETTLE: 0,
  SUBMITTED: 1,
  COMPLETED: 2,
  REJECTED: 3,
} as const;

export type SettleStatus = (typeof SettleStatus)[keyof typeof SettleStatus];

export const settleStatusOptions = [
  { value: SettleStatus.UNSETTLE, label: "Unsettle" },
  { value: SettleStatus.SUBMITTED, label: "Submitted" },
  { value: SettleStatus.COMPLETED, label: "Completed" },
  { value: SettleStatus.REJECTED, label: "Rejected" },
];

export const settleStatusColorMap: Record<number, { bg: string; text: string }> = {
  [SettleStatus.SUBMITTED]: { bg: "#fef3c7", text: "#92400e" },
  [SettleStatus.COMPLETED]: { bg: "#dcfce7", text: "#166534" },
  [SettleStatus.REJECTED]:  { bg: "#fee2e2", text: "#991b1b" },
};

// --- Payment Type ---
export const PaymentType = {
  CASH: 0,
  BANK: 1,
  TRANSFER: 2,
  OTHER: 3,
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const paymentTypeOptions = [
  { value: PaymentType.CASH, label: "Cash" },
  { value: PaymentType.BANK, label: "Bank" },
  { value: PaymentType.TRANSFER, label: "Transfer" },
  { value: PaymentType.OTHER, label: "Other" },
];

/**
 * Returns the label for a given payment type number.
 */
export function getPaymentTypeLabel(type?: number): string {
  return paymentTypeOptions.find((o) => o.value === type)?.label ?? "Unknown";
}
