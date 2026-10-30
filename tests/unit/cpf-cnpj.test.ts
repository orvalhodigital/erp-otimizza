import { describe, it, expect } from "vitest";
import {
  normalizeDocument,
  validateCPF,
  validateCNPJ,
  formatDocument,
} from "@/shared/cpf-cnpj";

describe("Shared: CPF & CNPJ Validation & Normalization", () => {
  it("normaliza documento removendo qualquer pontuação", () => {
    expect(normalizeDocument("123.456.789-00")).toBe("12345678900");
    expect(normalizeDocument("12.345.678/0001-90")).toBe("12345678000190");
    expect(normalizeDocument("texto com 123")).toBe("123");
  });

  it("valida CPF válido corretamente", () => {
    // CPFs com dígitos verificadores matematicamente válidos
    expect(validateCPF("52998224725")).toBe(true);
    expect(validateCPF("529.982.247-25")).toBe(true);
  });

  it("rejeita CPFs inválidos ou com dígitos errados", () => {
    expect(validateCPF("52998224726")).toBe(false); // Dígito final errado
    expect(validateCPF("12345678901")).toBe(false);
    expect(validateCPF("123")).toBe(false);
  });

  it("rejeita sequências repetidas de CPF conhecidas", () => {
    expect(validateCPF("11111111111")).toBe(false);
    expect(validateCPF("00000000000")).toBe(false);
    expect(validateCPF("99999999999")).toBe(false);
  });

  it("valida CNPJ válido corretamente", () => {
    // CNPJ matematicamente válido
    expect(validateCNPJ("11.222.333/0001-81")).toBe(true);
    expect(validateCNPJ("11222333000181")).toBe(true);
  });

  it("rejeita CNPJ com dígitos verificadores incorretos", () => {
    expect(validateCNPJ("11222333000182")).toBe(false);
    expect(validateCNPJ("00000000000000")).toBe(false);
    expect(validateCNPJ("1234")).toBe(false);
  });

  it("formata documentos para apresentação amigável", () => {
    expect(formatDocument("52998224725")).toBe("529.982.247-25");
    expect(formatDocument("11222333000181")).toBe("11.222.333/0001-81");
  });
});
