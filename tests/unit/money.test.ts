import { describe, it, expect } from "vitest";
import {
  toCents,
  fromCents,
  formatBRL,
  splitInstallments,
  calculateRemaining,
} from "@/shared/money";

describe("Shared: Money Precision & Installments Math", () => {
  it("converte valores decimais e strings para centavos inteiros sem erros IEEE 754", () => {
    expect(toCents(10.55)).toBe(1055);
    expect(toCents("10.55")).toBe(1055);
    expect(toCents("1.234,56")).toBe(123456);
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.1 + 0.2 no JS costuma dar 0.30000000000000004
  });

  it("converte centavos de volta para decimal", () => {
    expect(fromCents(1055)).toBe(10.55);
    expect(fromCents(30)).toBe(0.3);
  });

  it("formata valor em padrão monetário BRL", () => {
    const formatted = formatBRL(123456);
    // BRL formata como R$ 1.234,56 (com espaço que pode ser nbsp)
    expect(formatted).toContain("1.234,56");
    expect(formatted).toContain("R$");
  });

  it("divide valor em parcelas sem perder nenhum centavo residual", () => {
    // R$ 100,00 dividido em 3 parcelas: 33,34 + 33,33 + 33,33 = 100,00
    const installments = splitInstallments(10000, 3);
    expect(installments).toHaveLength(3);
    expect(installments).toEqual([3334, 3333, 3333]);

    const sum = installments.reduce((acc, curr) => acc + curr, 0);
    expect(sum).toBe(10000);
  });

  it("divide valor perfeitamente divisível", () => {
    const installments = splitInstallments(10000, 2);
    expect(installments).toEqual([5000, 5000]);
  });

  it("rejeita quantidade inválida de parcelas", () => {
    expect(() => splitInstallments(10000, 0)).toThrow();
    expect(() => splitInstallments(10000, -1)).toThrow();
  });

  it("calcula saldo remanescente de título corretamente", () => {
    expect(calculateRemaining(10000, 4000)).toBe(6000);
    expect(calculateRemaining(10000, 10000)).toBe(0);
    expect(calculateRemaining(10000, 12000)).toBe(0); // Liquidação superior não deixa saldo negativo
  });
});
