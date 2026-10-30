export type SaleStatus = "DRAFT" | "CONFIRMED" | "CANCELED";

export interface SaleItem {
  id: string;
  saleId: string;
  productId?: string | null;
  variantId?: string | null;
  description: string;
  quantity: number;
  unitPriceInCents: number;
  totalPriceInCents: number;
}

export interface Sale {
  id: string;
  code: number;
  clientId: string;
  status: SaleStatus;
  totalAmountInCents: number;
  discountAmountInCents: number;
  saleDate: string; // YYYY-MM-DD
  items: SaleItem[];
  createdAt: Date;
  updatedAt: Date;
}
