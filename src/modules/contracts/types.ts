import { BillingPeriod } from "../catalog/types";

export type ContractStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "CANCELED" | "COMPLETED";

export interface ContractItem {
  id: string;
  contractId: string;
  productId?: string | null;
  variantId?: string | null;
  description: string;
  quantity: number;
  unitPriceInCents: number;
  totalPriceInCents: number;
}

export interface Contract {
  id: string;
  clientId: string;
  title: string;
  billingPeriod: BillingPeriod;
  dueDay: number; // 1 a 31
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  status: ContractStatus;
  totalRecurringAmountInCents: number;
  items: ContractItem[];
  createdAt: Date;
  updatedAt: Date;
}
