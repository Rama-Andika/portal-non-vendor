import type { BankItem } from "./bank.type";

export type NonVendorUser = {
  id: string;
  username: string;
  email: string;
  companyName: string;
  companyType: string;
  otherCompanyType: string | null;
  address: string;
  province: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  website: string | null;
  banks: BankItem[];
  status: string;
  revisionReason: string | null;
  createdAt: string;
};

