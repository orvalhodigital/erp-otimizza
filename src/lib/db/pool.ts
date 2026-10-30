import pg from "pg";
import { getEnv } from "@/lib/env";

const { Pool } = pg;

declare global {
  var __dbPool: pg.Pool | undefined;
}

function shouldEnableSsl(connectionString: string): boolean {
  if (connectionString.includes("sslmode=require") || connectionString.includes("sslmode=no-verify")) {
    return true;
  }
  if (connectionString.includes(".supabase.co") || connectionString.includes(".pooler.supabase.com")) {
    return true;
  }
  return process.env.NODE_ENV === "production";
}

export function createPoolConfig(connectionString: string) {
  const isServerless = process.env.VERCEL === "1";
  const useSsl = shouldEnableSsl(connectionString);

  // Limpar parâmetros sslmode da query string para que o pg não force verify-full
  // garantindo compatibilidade com certificados auto-assinados de proxies intermediários
  let cleanedConnectionString = connectionString;
  if (useSsl) {
    cleanedConnectionString = connectionString
      .replace(/[?&]sslmode=[^&]+/g, "")
      .replace(/\?$/, "");
  }

  return {
    connectionString: cleanedConnectionString,
    // Em ambientes serverless (Vercel) conectados ao Supavisor/Pooler, cada lambda só precisa de 1 a 2 conexões
    max: isServerless ? 2 : (process.env.NODE_ENV === "production" ? 10 : 5),
    idleTimeoutMillis: isServerless ? 10000 : 30000,
    connectionTimeoutMillis: 5000,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

export function getDbPool(): pg.Pool {
  const env = getEnv();

  // Em ambientes serverless na Vercel, reusar a instância na memória da lambda ativa
  if (process.env.VERCEL === "1") {
    if (!global.__dbPool) {
      global.__dbPool = new Pool(createPoolConfig(env.DATABASE_URL));
    }
    return global.__dbPool;
  }

  // Em produção tradicional
  if (process.env.NODE_ENV === "production") {
    return new Pool(createPoolConfig(env.DATABASE_URL));
  }

  // Em desenvolvimento local, reutilizar pool global para evitar vazamento no Hot Reload
  if (!global.__dbPool) {
    global.__dbPool = new Pool(createPoolConfig(env.DATABASE_URL));
  }

  return global.__dbPool;
}

export function getMigrationDbPool(): pg.Pool {
  const env = getEnv();
  // Para migrations, preferir DIRECT_URL (porta 5432 / session mode no Supabase) se configurada
  const connString = env.DIRECT_URL || env.DATABASE_URL;
  return new Pool({
    ...createPoolConfig(connString),
    max: 1, // Migrations são executadas estritamente de forma serial
  });
}

export async function query<R extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<R>> {
  const pool = getDbPool();
  const start = Date.now();
  const res = await pool.query<R>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development" && duration > 100) {
    console.warn(`[SLOW QUERY] ${duration}ms: ${text.slice(0, 80)}...`);
  }
  return res;
}

export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pool = getDbPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function checkDatabaseConnection(): Promise<{
  ok: boolean;
  latencyMs?: number;
  error?: string;
  provider?: string;
}> {
  const start = Date.now();
  const env = getEnv();
  const isSupabase = env.DATABASE_URL.includes("supabase.co") || env.DATABASE_URL.includes("supabase.com");

  try {
    const pool = getDbPool();
    await pool.query("SELECT 1 AS healthcheck");
    return {
      ok: true,
      latencyMs: Date.now() - start,
      provider: isSupabase ? "Supabase PostgreSQL" : "Local/Dedicated PostgreSQL",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Falha ao conectar no PostgreSQL";
    return {
      ok: false,
      error: message,
      provider: isSupabase ? "Supabase PostgreSQL" : "Local/Dedicated PostgreSQL",
    };
  }
}
