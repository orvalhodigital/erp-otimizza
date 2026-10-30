export interface BillingBatchResult {
  periodKey: string;
  totalContractsProcessed: number;
  titlesGenerated: number;
  skippedAlreadyBilled: number;
  errors: Array<{ contractId: string; error: string }>;
}

export interface GenerateBillingParams {
  year: number;
  month: number;
  contractIds?: string[];
}
