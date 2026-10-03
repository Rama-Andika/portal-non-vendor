import { DOCUMENT_STATUS } from "@/enums/document-status.enum";

export type PphType = {
  code: string;
  label: string;
};

export const PORTAL_REQUEST_STATUS_VALUES = [
  DOCUMENT_STATUS.DRAFT,
  DOCUMENT_STATUS.WAITING_APPROVAL,
  DOCUMENT_STATUS.APPROVED,
  DOCUMENT_STATUS.REJECTED,
  DOCUMENT_STATUS.CANCELLED,
  DOCUMENT_STATUS.REVISION,
] as const;

export type PortalRequestStatus = (typeof PORTAL_REQUEST_STATUS_VALUES)[number];

export const PORTAL_REQUEST_STATUS_OPTIONS = [
  { value: DOCUMENT_STATUS.DRAFT, label: "Draft" },
  { value: DOCUMENT_STATUS.WAITING_APPROVAL, label: "Waiting Approval" },
  { value: DOCUMENT_STATUS.APPROVED, label: "Approved" },
  { value: DOCUMENT_STATUS.REJECTED, label: "Rejected" },
  { value: DOCUMENT_STATUS.CANCELLED, label: "Cancelled" },
  { value: DOCUMENT_STATUS.REVISION, label: "Revision" },
] as const;

export const REQUEST_TYPE = {
  REIMBURSEMENT: 1,
  PURCHASE: 2,
  ALLOWANCE_REQUEST: 3,
  BUDGET_REQUEST: 4,
  BILLING_AIRPORT: 5,
  INTERNAL_TRANSACTION: 6,
} as const;

export type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE];

export const REQUEST_TYPE_OPTIONS = [
  { value: REQUEST_TYPE.REIMBURSEMENT, label: "Reimbursement" },
  { value: REQUEST_TYPE.PURCHASE, label: "Purchase" },
  { value: REQUEST_TYPE.ALLOWANCE_REQUEST, label: "Allowance Request" },
  { value: REQUEST_TYPE.BUDGET_REQUEST, label: "Budget Request" },
  { value: REQUEST_TYPE.BILLING_AIRPORT, label: "Billing Airport" },
  { value: REQUEST_TYPE.INTERNAL_TRANSACTION, label: "Internal Transaction" },
];

export const PAYMENT_TYPE = {
  NO_PAYMENT: 0,
  CASH: 1,
  BANK: 2,
  RECEIVABLE: 4,
} as const;

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export const PAYMENT_TYPE_OPTIONS = [
  { value: PAYMENT_TYPE.NO_PAYMENT, label: "No Payment" },
  { value: PAYMENT_TYPE.CASH, label: "Cash" },
  { value: PAYMENT_TYPE.BANK, label: "Bank" },
  { value: PAYMENT_TYPE.RECEIVABLE, label: "Receivable" },
];

export interface PortalRequestItem {
  id: string;
  number: string;
  date: string;
  type: number;
  typeLabel: string;
  department: string;
  amount: number;
  status: PortalRequestStatus;
  purpose: string;
  bankpoPaymentId: string;
  bankpoPaymentNumber: string;
  portalNonVendorUserId: string;
  portalNonVendorCompanyName: string;
  pph23Filename?: string | null;
  requestPph23?: 0 | 1 | null;
}

export interface GetPortalRequestsParams {
  page: number;
  size: number;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  number?: string;
  startDate?: string;
  endDate?: string;
  status?: PortalRequestStatus;
  companyName?: string;
  portalNonVendorUserId: string;
}

export interface CreatePortalRequestDetailPayload {
  id?: number | string;
  description: string;
  invoiceNumber?: string;
  qty: number;
  currencyId: string;
  price: number;
  rate: number;
  vatAmount?: number;
  vatPercent?: number;
  pphAmount?: number;
  pphPercent?: number;
  pphType?: string;
}

export interface CreatePortalRequestPayload {
  portalNonVendorUserId: string;
  departmentId: string | null;
  requestType: string;
  paymentType: string;
  bankName: string;
  beneficiaryName: string;
  accountNo: string;
  bankBranch: string;
  swiftCode?: string;
  purpose: string;
  status: PortalRequestStatus;
  vatAmount: number;
  vatPercent: number;
  pphAmount: number;
  pphPercent: number;
  /** 0 = VAT manual per baris, 1 = VAT dihitung otomatis backend. Kirim hanya 0 atau 1. */
  autoVat: number;
  /** Persen VAT 0-100. Nilainya diabaikan backend saat autoVat = 0. */
  autoVatPercent: number;
  details: CreatePortalRequestDetailPayload[];
}

export interface UpdatePortalRequestDetailPayload {
  id?: string;
  description: string;
  qty: number;
  currencyId: number | string;
  price: number;
  rate: number;
  vatAmount: number;
  vatPercent: number;
  pphAmount: number;
  pphPercent: number;
  invoiceNumber?: string;
  pphType?: string;
}

export interface UpdatePortalRequestPayload {
  portalNonVendorUserId: number | string;
  departmentId: number | string | null;
  requestType: string;
  paymentType: string;
  bankName: string;
  beneficiaryName: string;
  accountNo: string;
  bankBranch: string;
  swiftCode?: string;
  purpose: string;
  status: PortalRequestStatus | string;
  vatAmount: number;
  vatPercent: number;
  pphAmount: number;
  pphPercent: number;
  /** 0 = VAT manual per baris, 1 = VAT dihitung otomatis backend. Kirim hanya 0 atau 1. */
  autoVat: number;
  /** Persen VAT 0-100. Nilainya diabaikan backend saat autoVat = 0. */
  autoVatPercent: number;
  details: UpdatePortalRequestDetailPayload[];
}

export interface PortalRequestDetailItem {
  id: string;
  description: string;
  invoiceNumber?: string | null;
  qty: number;
  currencyId: string;
  price: number;
  rate: number;
  request: number;
  vatAmount?: number;
  vatPercent?: number;
  pphAmount?: number;
  pphPercent?: number;
  pphType?: string;
  pphTypeLabel?: string;
  filename?: string | null;
}

export interface PortalRequestDetailResponse {
  id: string;
  number: string;
  date: string;
  departmentId: string;
  requestType: number;
  paymentType: number;
  bankName: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  accountNo: string;
  bankBranch: string;
  swiftCode: string;
  purpose: string;
  subAmount: number;
  vatAmount: number;
  vatPercent: number;
  pphAmount: number;
  pphPercent: number;
  totalAmount: number;
  portalNonVendorUserId: string;
  portalNonVendorCompanyName: string;
  companyName: string;
  status: string; // From spec: "DRAFT", "WAITING_APPROVAL", etc.
  bankpoPaymentId: string;
  bankpoPaymentNumber: string;
  formPath: string;
  attachmentPath: string;
  approvalDocPath: string;
  settleStatus: number;
  settleStatusLabel?: string;
  settleAmount?: number;
  settleNote?: string;
  settlePaymentType?: number;
  settlementDocPath?: string;
  settlementDocPath2?: string;
  settlementTransferDocPath?: string;
  reason?: string;
  /** BARU: 0 atau 1. Dipakai untuk mengisi kondisi checkbox saat form edit dibuka. */
  autoVat?: number;
  /** BARU: persen yang tersimpan. Bernilai 0 kalau autoVat = 0. */
  autoVatPercent?: number;
  details: PortalRequestDetailItem[];
}

export interface RequestPph23Payload {
  requestPph23: 0 | 1;
}
