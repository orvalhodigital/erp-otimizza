/**
 * Utilitários para Faturamento e Recorrências
 * Regras estritas para determinação de data de vencimento em meses com menos de 31 dias
 * e geração de chave de idempotência unívoca por período.
 */

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  // month: 1 (Janeiro) a 12 (Dezembro)
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/**
 * Calcula a data de vencimento efetiva para uma assinatura/contrato recorrente.
 * Se o dia base contratado for 29, 30 ou 31 e o mês possuir menos dias,
 * o vencimento recai no último dia daquele mês.
 *
 * @param baseDay Dia contratado de vencimento (1 a 31)
 * @param year Ano de competência (ex: 2026)
 * @param month Mês de competência (1 a 12)
 * @returns Data no formato ISO YYYY-MM-DD
 */
export function calculateEffectiveDueDate(baseDay: number, year: number, month: number): string {
  if (baseDay < 1 || baseDay > 31) {
    throw new Error(`Dia base de vencimento inválido: ${baseDay}. Deve estar entre 1 e 31.`);
  }
  if (month < 1 || month > 12) {
    throw new Error(`Mês inválido: ${month}. Deve estar entre 1 e 12.`);
  }

  const maxDays = getDaysInMonth(year, month);
  const effectiveDay = Math.min(baseDay, maxDays);

  const mStr = String(month).padStart(2, "0");
  const dStr = String(effectiveDay).padStart(2, "0");
  return `${year}-${mStr}-${dStr}`;
}

/**
 * Gera a chave canônica de idempotência para faturamento recorrente.
 * Exemplo: "contract-123_2026-11"
 */
export function generateBillingPeriodKey(contractId: string, year: number, month: number): string {
  const mStr = String(month).padStart(2, "0");
  return `${contractId}_${year}-${mStr}`;
}
