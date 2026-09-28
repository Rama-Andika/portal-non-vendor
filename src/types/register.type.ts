import type { BankItem } from "./bank.type";

export type { BankItem };

export type RegisterNonVendorRequest = {
  username: string;
  password: string;
  email: string;
  companyName: string;
  companyType: string;
  otherCompanyType?: string;
  address: string;
  province: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  website?: string;
  banks: BankItem[];
};


