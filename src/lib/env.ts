import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/sistema_erp_dev"),
  DIRECT_URL: z.string().url().optional(),
  DATABASE_URL_TEST: z.string().url().default("postgresql://postgres:postgres@localhost:5432/sistema_erp_test"),
  SESSION_SECRET: z.string().min(16).default("dev_secret_key_needs_replacement_in_production_32chars"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_PROJECT_REF: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

export function getEnv(): Env {
  if (!parsedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error("❌ Falha na validação das variáveis de ambiente:", result.error.format());
      throw new Error("Configuração de ambiente inválida");
    }
    parsedEnv = result.data;
  }
  return parsedEnv;
}
