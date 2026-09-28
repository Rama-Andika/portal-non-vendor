export const InvoiceStatus = {
  DRAFT: 0,
  APPROVED: 1,
  CHECKED: 2,
  CANCEL: 3,
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const invoiceStatusOptions = [
  { value: InvoiceStatus.DRAFT, label: "Draft" },
  { value: InvoiceStatus.APPROVED, label: "Approved" },
  { value: InvoiceStatus.CHECKED, label: "Checked" },
  { value: InvoiceStatus.CANCEL, label: "Cancel" },
];

export interface InvoiceRequestItem {
  id: string;
  number: string;
  date: string; // ISO string
  type: number;
  typeLabel: string;
  department: string;
  amount: number;
  status: InvoiceStatus;
  statusLabel: string;
  purpose: string;
  portalNonVendorUserId?: string;
  portalNonVendorCompanyName?: string;
  settleStatus: number;
  settleStatusLabel?: string;
  settleAmount?: number;
  settleNote?: string;
  settlePaymentType?: number;
  refId?: string | null;
}

export interface InvoiceListParams {
  page: number;
  size: number;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  journalNumber?: string;
  startDate?: string;
  endDate?: string;
  status?: InvoiceStatus;
  portalNonVendorUserId?: string;
  companyName?: string;
}
