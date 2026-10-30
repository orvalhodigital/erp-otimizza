import { describe, it, expect } from "vitest";
import { getEnv } from "@/lib/env";

describe("Infrastructure: Environment Configuration Schema", () => {
  it("carrega e valida as variáveis de ambiente essenciais com fallbacks seguros", () => {
    const env = getEnv();
    expect(env).toBeDefined();
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
    expect(typeof env.PORT).toBe("number");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.DATABASE_URL).toContain("postgresql://");
    expect(env.DATABASE_URL_TEST).toContain("postgresql://");
    expect(env.SESSION_SECRET.length).toBeGreaterThanOrEqual(16);
  });
});
