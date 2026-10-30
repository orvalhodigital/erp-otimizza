export type ProductType = "SIMPLE_PRODUCT" | "VARIABLE_PRODUCT" | "SERVICE";
export type BillingPeriod = "ONE_TIME" | "MONTHLY" | "YEARLY";
export type ItemStatus = "ACTIVE" | "INACTIVE";

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  sku?: string | null;
  unit: string;
  basePriceInCents: number;
  billingPeriod: BillingPeriod;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  priceInCents: number;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}
