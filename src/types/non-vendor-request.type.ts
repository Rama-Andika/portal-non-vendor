export interface NonVendorRequestDetail {
  description: string;
  qty: number;
  currencyId: string;
  price: number;
  rate: number;
  vatAmount?: number;
  vatPercent?: number;
  pphAmount?: number;
  pphPercent?: number;
}

export interface CreateNonVendorRequest {
  departmentId: string;
  requestType: number;
  paymentType: number;
  bankName: string;
  beneficiaryName: string;
  accountNo: string;
  bankBranch: string;
  swiftCode?: string;
  purpose: string;
  vatAmount: number;
  vatPercent: number;
  pphAmount: number;
  pphPercent: number;
  portalNonVendorUserId: string;
  details: NonVendorRequestDetail[];
}

export interface NonVendorRequestDetailItem {
  id: string;
  description: string;
  qty: number;
  currencyId: string;
  price: number;
  rate: number;
  vatAmount?: number;
  vatPercent?: number;
  pphAmount?: number;
  pphPercent?: number;
}

export interface NonVendorRequestResponse {
  id: string;
  number: string;
  date: string;
  departmentId: string;
  requestType: number;
  paymentType: number;
  bankName: string;
  beneficiaryName: string;
  beneficiaryAccount?: string;
  accountNo: string;
  bankBranch: string;
  swiftCode?: string;
  purpose: string;
  subAmount: number;
  vatAmount: number;
  vatPercent: number;
  pphAmount: number;
  pphPercent: number;
  totalAmount: number;
  portalNonVendorUserId: string;
  companyName: string;
  status: number;
  settleStatus: number;
  settleStatusLabel?: string;
  settleAmount?: number;
  settleNote?: string;
  settlePaymentType?: number;
  refId?: string | null;
  details: NonVendorRequestDetailItem[];
  form_path?: string | null;
  attachment_path?: string | null;
  approval_doc_path?: string | null;
  formPath?: string | null;
  attachmentPath?: string | null;
  approvalDocPath?: string | null;
  settlementDocPath?: string | null;
  settlementDocPath2?: string | null;
  settlementTransferDocPath?: string | null;
}

export interface UpdateNonVendorRequest {
  departmentId: string;
  requestType: number;
  paymentType: number;
  bankName: string;
  beneficiaryName: string;
  beneficiaryAccount?: string;
  accountNo: string;
  bankBranch: string;
  swiftCode?: string;
  purpose: string;
  vatAmount: number;
  vatPercent: number;
  pphAmount: number;
  pphPercent: number;
  portalNonVendorUserId: string;
  status: number;
  details: NonVendorRequestDetail[];
}

export interface SettleRequestPayload {
  portalNonVendorUserId: string;
  settleAmount: number;
  settleNote: string;
  settlePaymentType: number;
}
