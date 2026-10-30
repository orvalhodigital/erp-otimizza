import { describe, it, expect } from "vitest";
import {
  isLeapYear,
  getDaysInMonth,
  calculateEffectiveDueDate,
  generateBillingPeriodKey,
} from "@/shared/recurrence";

describe("Shared: Recurrence & End-of-Month Due Dates", () => {
  it("identifica corretamente anos bissextos", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(2000)).toBe(true); // Múltiplo de 400
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(1900)).toBe(false); // Múltiplo de 100 não bissexto
  });

  it("retorna dias corretos de cada mês incluindo fevereiro", () => {
    expect(getDaysInMonth(2026, 1)).toBe(31);
    expect(getDaysInMonth(2026, 2)).toBe(28); // 2026 não é bissexto
    expect(getDaysInMonth(2024, 2)).toBe(29); // 2024 é bissexto
    expect(getDaysInMonth(2026, 4)).toBe(30); // Abril
  });

  it("ajusta vencimento do dia 31 para o último dia de fevereiro (28 em ano comum, 29 em bissexto)", () => {
    // Vencimento dia 31 em ano normal (2026) -> 2026-02-28
    expect(calculateEffectiveDueDate(31, 2026, 2)).toBe("2026-02-28");

    // Vencimento dia 31 em ano bissexto (2024) -> 2024-02-29
    expect(calculateEffectiveDueDate(31, 2024, 2)).toBe("2024-02-29");

    // Vencimento dia 30 em fevereiro ano normal -> 2026-02-28
    expect(calculateEffectiveDueDate(30, 2026, 2)).toBe("2026-02-28");
  });

  it("ajusta vencimento do dia 31 para meses de 30 dias (ex: Abril)", () => {
    expect(calculateEffectiveDueDate(31, 2026, 4)).toBe("2026-04-30");
    expect(calculateEffectiveDueDate(31, 2026, 6)).toBe("2026-06-30");
    expect(calculateEffectiveDueDate(31, 2026, 9)).toBe("2026-09-30");
    expect(calculateEffectiveDueDate(31, 2026, 11)).toBe("2026-11-30");
  });

  it("mantém dia 31 em meses que possuem 31 dias", () => {
    expect(calculateEffectiveDueDate(31, 2026, 1)).toBe("2026-01-31");
    expect(calculateEffectiveDueDate(31, 2026, 3)).toBe("2026-03-31");
    expect(calculateEffectiveDueDate(31, 2026, 5)).toBe("2026-05-31");
    expect(calculateEffectiveDueDate(31, 2026, 7)).toBe("2026-07-31");
  });

  it("rejeita dias de vencimento fora da faixa 1-31", () => {
    expect(() => calculateEffectiveDueDate(0, 2026, 1)).toThrow();
    expect(() => calculateEffectiveDueDate(32, 2026, 1)).toThrow();
  });

  it("gera chave canônica de idempotência por período", () => {
    const key = generateBillingPeriodKey("contract-uuid-123", 2026, 11);
    expect(key).toBe("contract-uuid-123_2026-11");
  });
});
