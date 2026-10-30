export type TitleType = "RECEIVABLE" | "PAYABLE";
export type TitleStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELED";
export type SettlementStatus = "CONFIRMED" | "REVERSED";
export type MovementType = "CREDIT" | "DEBIT";
export type PaymentMethod = "PIX" | "BOLETO" | "CREDIT_CARD" | "BANK_TRANSFER" | "CASH";

export interface FinancialAccount {
  id: string;
  name: string;
  bankName?: string | null;
  accountType: "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT";
  initialBalanceInCents: number;
  currentBalanceInCents: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface FinancialTitle {
  id: string;
  type: TitleType;
  clientId?: string | null;
  saleId?: string | null;
  contractId?: string | null;
  categoryId: string;
  periodKey?: string | null;
  titleNumber: string;
  description: string;
  originalAmountInCents: number;
  paidAmountInCents: number;
  remainingAmountInCents: number;
  dueDate: string; // YYYY-MM-DD
  competenceDate: string; // YYYY-MM-DD
  status: TitleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialSettlement {
  id: string;
  titleId: string;
  accountId: string;
  amountInCents: number;
  interestInCents: number;
  fineInCents: number;
  discountInCents: number;
  settlementDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: SettlementStatus;
  notes?: string | null;
  createdAt: Date;
}

export interface FinancialMovement {
  id: string;
  accountId: string;
  settlementId?: string | null;
  type: MovementType;
  amountInCents: number;
  movementDate: string; // YYYY-MM-DD
  description: string;
  transferPairId?: string | null;
  createdAt: Date;
}
