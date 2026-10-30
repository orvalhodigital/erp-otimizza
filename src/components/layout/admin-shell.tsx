"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  DollarSign,
  TrendingUp,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X,
  Database,
  ExternalLink,
  CreditCard,
  Building2,
  RefreshCw,
} from "lucide-react";

type NavSection =
  | "dashboard"
  | "clients"
  | "catalog"
  | "contracts"
  | "finance"
  | "cashflow"
  | "settings";

interface HealthData {
  status: string;
  uptimeSeconds: number;
  nodeVersion: string;
  environment: string;
  services: {
    database: {
      status: string;
      latencyMs: number | null;
      error: string | null;
    };
  };
}

export function AdminShell() {
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setHealth(data);
      })
      .catch(() => {
        if (isMounted) setHealth(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "clients" as const, label: "Clientes", icon: Users },
    { id: "catalog" as const, label: "Produtos & Serviços", icon: Package },
    { id: "contracts" as const, label: "Contratações & Vendas", icon: FileText },
    { id: "finance" as const, label: "Financeiro", icon: DollarSign },
    { id: "cashflow" as const, label: "Fluxo de Caixa", icon: TrendingUp },
    { id: "settings" as const, label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-72 bg-slate-900/90 border-r border-slate-800/80 z-50 flex flex-col justify-between transition-transform duration-200 backdrop-blur-md ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
                ERP
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  Sistema ERP
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    v0.1.0
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Comercial & Financeiro</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 font-mono">
              Módulos do Sistema
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Readiness Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Supabase Postgres
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Pronto
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Vercel Serverless
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pronto
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 text-center">
            Localhost: <strong className="text-slate-300">Porta 3000</strong>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-md border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white capitalize">
                {activeSection === "dashboard"
                  ? "Dashboard Executivo"
                  : activeSection === "clients"
                  ? "Gestão de Clientes"
                  : activeSection === "catalog"
                  ? "Catálogo de Produtos & Serviços"
                  : activeSection === "contracts"
                  ? "Vendas & Contratações"
                  : activeSection === "finance"
                  ? "Gestão Financeira"
                  : activeSection === "cashflow"
                  ? "Fluxo de Caixa Realizado & Projetado"
                  : "Configurações da Plataforma"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Demonstração Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Modo Demonstração
            </span>

            {/* Healthcheck Indicator */}
            <button
              onClick={handleRefreshHealth}
              disabled={healthLoading}
              title="Clique para verificar conectividade do servidor"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition text-slate-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? "animate-spin" : ""}`} />
              API:{" "}
              {health ? (
                <span className={health.status === "healthy" ? "text-emerald-400" : "text-amber-400"}>
                  {health.status === "healthy" ? "Online" : "Ativa"}
                </span>
              ) : (
                <span className="text-slate-400">Verificando...</span>
              )}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                OP
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-slate-200">Operador ERP</div>
                <div className="text-[10px] text-slate-500">ADMIN</div>
              </div>
            </div>
          </div>
        </header>

        {/* Body Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                  Ambiente Localhost Ativo • Preparado para Supabase & Vercel
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Monólito modular estruturado com tipagem estrita, banco relacional PostgreSQL e pooler serverless configurado.
              </p>
            </div>
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium underline-offset-4 hover:underline"
            >
              Consultar endpoint JSON /api/health <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* RENDER VIEWS */}
          {activeSection === "dashboard" && <DashboardView />}
          {activeSection === "clients" && <ClientsView />}
          {activeSection === "catalog" && <CatalogView />}
          {activeSection === "contracts" && <ContractsView />}
          {activeSection === "finance" && <FinanceView />}
          {activeSection === "cashflow" && <CashflowView />}
          {activeSection === "settings" && <SettingsView health={health} />}
        </main>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SEÇÃO: DASHBOARD VIEW
// -----------------------------------------------------------------------------
function DashboardView() {
  const kpis = [
    {
      title: "Clientes Cadastrados",
      value: "128",
      sub: "114 ativos • 14 inativos",
      icon: Users,
      trend: "+12% este mês",
      trendColor: "text-emerald-400",
    },
    {
      title: "Faturamento Previsto",
      value: "R$ 48.750,00",
      sub: "Competência mês corrente",
      icon: DollarSign,
      trend: "BRL • Moeda Oficial",
      trendColor: "text-blue-400",
    },
    {
      title: "Títulos a Receber",
      value: "R$ 24.300,00",
      sub: "R$ 21.500 em dia • R$ 2.800 vencidos",
      icon: CreditCard,
      trend: "Baixas parciais ativas",
      trendColor: "text-amber-400",
    },
    {
      title: "Saldo em Caixa / Bancos",
      value: "R$ 63.820,00",
      sub: "2 Contas Correntes + 1 Caixa",
      icon: Building2,
      trend: "Saldo Realizado",
      trendColor: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">{kpi.title}</span>
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="text-2xl font-bold tracking-tight text-white">{kpi.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
              </div>
              <div className="pt-2 border-t border-slate-800/60 text-[11px] font-medium flex items-center gap-1">
                <span className={kpi.trendColor}>{kpi.trend}</span>
                <span className="text-slate-400 text-[10px] ml-auto">exemplo</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Titles & System Principles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Financial Titles */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Títulos Financeiros Recentes (Demonstração)</h3>
              <p className="text-xs text-slate-400">
                Exemplos de controle com suporte a pagamentos parciais e vencimento estrito
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Mock
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Título / Cliente</th>
                  <th className="py-2.5 px-3">Vencimento</th>
                  <th className="py-2.5 px-3">Valor Nominal</th>
                  <th className="py-2.5 px-3">Saldo Devedor</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-medium text-white">TIT-2026-001</div>
                    <div className="text-[10px] text-slate-400">Empresa Alpha Soluções LTDA (PJ)</div>
                  </td>
                  <td className="py-3 px-3">10/11/2026</td>
                  <td className="py-3 px-3 font-mono text-white">R$ 5.400,00</td>
                  <td className="py-3 px-3 font-mono text-white">R$ 0,00</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      PAGO
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-medium text-white">TIT-2026-002</div>
                    <div className="text-[10px] text-slate-400">Carlos Eduardo Silva (PF)</div>
                  </td>
                  <td className="py-3 px-3">28/02/2026</td>
                  <td className="py-3 px-3 font-mono text-white">R$ 1.200,00</td>
                  <td className="py-3 px-3 font-mono text-amber-300">R$ 400,00</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      PARCIAL
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-medium text-white">TIT-2026-003</div>
                    <div className="text-[10px] text-slate-400">Beta Consultoria e Tecnologia (PJ)</div>
                  </td>
                  <td className="py-3 px-3">15/11/2026</td>
                  <td className="py-3 px-3 font-mono text-white">R$ 3.850,00</td>
                  <td className="py-3 px-3 font-mono text-white">R$ 3.850,00</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      PENDENTE
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Architecture Guide */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Infraestrutura & Governança
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            O ERP opera em um monólito modular Next.js sobre PostgreSQL relacional (compatível nativamente com o Supabase).
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <strong className="text-slate-200 block text-[11px]">Banco de Dados:</strong>
              <span className="text-slate-400">Supabase PostgreSQL via porta 6543 (pooler) para serverless e 5432 direta para migrações.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <strong className="text-slate-200 block text-[11px]">Hospedagem:</strong>
              <span className="text-slate-400">Vercel Serverless. Sem escrita local em disco e com pool de conexões sob demanda.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <strong className="text-slate-200 block text-[11px]">Segurança:</strong>
              <span className="text-slate-400">Zero segredos no frontend. Sessões isoladas em cookies seguros HttpOnly.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SEÇÃO: CLIENTES VIEW
// -----------------------------------------------------------------------------
function ClientsView() {
  const mockClients = [
    {
      id: "1",
      name: "Alpha Soluções em Tecnologia LTDA",
      tradeName: "Alpha Tech",
      doc: "11.222.333/0001-81",
      type: "PJ",
      email: "financeiro@alphatech.com.br",
      phone: "(11) 98765-4321",
      status: "ACTIVE",
    },
    {
      id: "2",
      name: "Carlos Eduardo Silva",
      tradeName: "-",
      doc: "529.982.247-25",
      type: "PF",
      email: "carlos.silva@email.com",
      phone: "(21) 99123-4567",
      status: "ACTIVE",
    },
    {
      id: "3",
      name: "Distribuidora Nacional de Peças",
      tradeName: "Peças Mais",
      doc: "22.333.444/0001-90",
      type: "PJ",
      email: "contato@pecasmais.com.br",
      phone: "(31) 3211-9000",
      status: "INACTIVE",
    },
  ];

  return (
    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Clientes Cadastrados</h3>
          <p className="text-xs text-slate-400">
            Pessoas Físicas e Jurídicas com documentos normalizados e suporte a soft delete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            Módulo Clientes (Fase 2)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Tipo</th>
              <th className="py-2.5 px-3">Nome / Razão Social</th>
              <th className="py-2.5 px-3">CPF / CNPJ</th>
              <th className="py-2.5 px-3">Contato</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mockClients.map((c) => (
              <tr key={c.id}>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {c.type}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-white">{c.name}</div>
                  {c.tradeName !== "-" && (
                    <div className="text-[10px] text-slate-400">Fantasia: {c.tradeName}</div>
                  )}
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">{c.doc}</td>
                <td className="py-3 px-3">
                  <div>{c.email}</div>
                  <div className="text-[10px] text-slate-400">{c.phone}</div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      c.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {c.status === "ACTIVE" ? "ATIVO" : "INATIVO"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SEÇÃO: CATÁLOGO VIEW
// -----------------------------------------------------------------------------
function CatalogView() {
  const items = [
    {
      type: "SIMPLE_PRODUCT",
      name: "Cabo de Rede Blindado Cat6 (100m)",
      sku: "PROD-CABO-CAT6",
      price: "R$ 380,00",
      period: "ONE_TIME",
      status: "ATIVO",
    },
    {
      type: "VARIABLE_PRODUCT",
      name: "Uniforme Técnico Corporativo",
      sku: "VAR-UNIF-CORP",
      price: "R$ 89,90 - R$ 119,90",
      period: "ONE_TIME",
      status: "ATIVO",
      variants: "Tamanhos P, M, G, GG (Cores Azul e Preto)",
    },
    {
      type: "SERVICE",
      name: "Suporte e Manutenção de Infraestrutura TI",
      sku: "SRV-SUP-INFRA",
      price: "R$ 1.500,00",
      period: "MENSAL (Recorrente)",
      status: "ATIVO",
    },
  ];

  return (
    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Catálogo Unificado (Produtos & Serviços)</h3>
          <p className="text-xs text-slate-400">
            Produtos simples, produtos com variações de atributos e serviços avulsos ou recorrentes
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
          Catálogo (Fase 3)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {items.map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {item.type}
              </span>
              <h4 className="text-sm font-semibold text-white">{item.name}</h4>
              <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>
              {item.variants && (
                <p className="text-[11px] text-slate-400 italic">{item.variants}</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">{item.period}</div>
                <div className="text-sm font-bold text-white font-mono">{item.price}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SEÇÃO: CONTRATAÇÕES VIEW
// -----------------------------------------------------------------------------
function ContractsView() {
  return (
    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Contratações & Recorrências</h3>
          <p className="text-xs text-slate-400">
            Contratos com snapshots de preços negociados, periodicidades e dia de vencimento
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
          Contratos (Fase 4 & 5)
        </span>
      </div>

      <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-2 text-slate-300">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Regra de Fim de Mês Implementada:
        </div>
        <p>
          Contratos fixados no dia 31 vencem automaticamente no último dia de meses curtos (ex: 28 ou 29 de fevereiro e 30 de abril/junho), retornando ao dia 31 nos meses completos.
        </p>
        <p className="text-slate-400 font-mono text-[11px]">
          Chave de Idempotência: <code>contract-id_YYYY-MM</code> (bloqueia cobrança redundante no banco).
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SEÇÃO: FINANCEIRO VIEW
// -----------------------------------------------------------------------------
function FinanceView() {
  return (
    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Contas a Pagar e a Receber</h3>
          <p className="text-xs text-slate-400">
            Títulos com suporte a pagamentos parciais, estornos auditáveis e moeda BRL exata
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          Financeiro (Fase 6)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
          <strong className="text-emerald-400 block text-sm">Contas a Receber (Ativo)</strong>
          <p className="text-slate-400">Total em aberto: <strong className="text-white">R$ 24.300,00</strong></p>
          <p className="text-slate-400">Faturamento não aumenta caixa até a efetiva liquidação.</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
          <strong className="text-rose-400 block text-sm">Contas a Pagar (Passivo)</strong>
          <p className="text-slate-400">Total a pagar este mês: <strong className="text-white">R$ 14.800,00</strong></p>
          <p className="text-slate-400">Despesas categorizadas por centro de custo e fornecedor.</p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SEÇÃO: FLUXO DE CAIXA VIEW
// -----------------------------------------------------------------------------
function CashflowView() {
  return (
    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Fluxo de Caixa (Regime de Caixa)</h3>
          <p className="text-xs text-slate-400">
            Realizado (movimentações efetivadas) vs. Projetado (títulos com vencimento futuro)
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
          Caixa (Fase 7)
        </span>
      </div>

      <div className="p-6 rounded-lg bg-slate-950/60 border border-slate-800 text-center space-y-2">
        <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto" />
        <h4 className="text-sm font-semibold text-white">Separação Estrita de Regime</h4>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          O fluxo de caixa computa apenas transferências e liquidações efetivas. Transferências entre contas correntes internas são neutras e não poluem receitas ou despesas operacionais.
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SEÇÃO: CONFIGURAÇÕES VIEW
// -----------------------------------------------------------------------------
function SettingsView({ health }: { health: HealthData | null }) {
  return (
    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white">Configurações & Diagnóstico de Infraestrutura</h3>
        <p className="text-xs text-slate-400">
          Estado atual da aplicação, parâmetros de conexão e checklist de prontidão para Vercel e Supabase
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Card Supabase */}
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Supabase PostgreSQL
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Arquitetura Pronta
            </span>
          </div>
          <p className="text-slate-400">
            Camada de conexão preparada para o Transaction Pooler (porta 6543) e Direct Connection (porta 5432).
          </p>
          <div className="font-mono text-[11px] p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Status Conexão: {health?.services?.database?.status ?? "Aguardando URL Supabase"}
          </div>
        </div>

        {/* Card Vercel */}
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hospedagem Vercel
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Pronto para Deploy
            </span>
          </div>
          <p className="text-slate-400">
            Compatível com Next.js App Router serverless. Sem dependência de escrita em disco local.
          </p>
          <div className="font-mono text-[11px] p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Node: {health?.nodeVersion ?? "v24.18.0"} • Amb: {health?.environment ?? "development"}
          </div>
        </div>
      </div>
    </div>
  );
}
