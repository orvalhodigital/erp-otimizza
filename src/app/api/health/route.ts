import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db/pool";

export async function GET() {
  const dbHealth = await checkDatabaseConnection();

  const responsePayload = {
    status: dbHealth.ok ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV ?? "development",
    services: {
      database: {
        provider: dbHealth.provider ?? "PostgreSQL",
        status: dbHealth.ok ? "connected" : "disconnected",
        latencyMs: dbHealth.latencyMs ?? null,
        error: dbHealth.error ?? null,
      },
    },
  };

  // Retornar 200 permite que o AdminShell e ferramentas de monitoramento consumam o diagnóstico em JSON
  return NextResponse.json(responsePayload, { status: 200 });
}
