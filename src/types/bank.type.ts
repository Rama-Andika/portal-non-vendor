export type BankItem = {
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  swiftCode?: string;
  isPrimary: number; // 1 = primary, 0 = not primary
};
