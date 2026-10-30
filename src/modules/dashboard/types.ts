export interface DashboardOverviewKPIs {
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  finance: {
    totalReceivableInCents: number;
    totalOverdueInCents: number;
    totalPayableInCents: number;
    currentAvailableBalanceInCents: number;
  };
  monthlyRevenueInCents: number;
}
