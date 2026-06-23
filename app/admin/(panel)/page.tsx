import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";

async function count(table: string, filter?: (q: any) => any) {
  try {
    const supabase = await createReadClient();
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count, error } = await q;
    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export default async function Dashboard() {
  const [clientes, veiculos, disponiveis, leads, docs] = await Promise.all([
    count("clientes"),
    count("veiculos"),
    count("veiculos", (q) => q.eq("status", "disponivel")),
    count("leads_consignacao", (q) => q.eq("status", "novo")),
    count("documentos"),
  ]);

  const schemaPronto = clientes !== null;

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">
        Dashboard
      </h1>
      <p className="mt-1 text-[var(--color-mute)]">
        Visão geral da loja.
      </p>

      {!schemaPronto && (
        <div className="mt-6 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          ⚠️ Banco ainda não inicializado. Rode o <strong>schema.sql</strong> no
          SQL Editor do Supabase para ativar os módulos.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clientes" value={clientes} />
        <Stat label="Veículos no estoque" value={veiculos} />
        <Stat label="Disponíveis" value={disponiveis} />
        <Stat label="Leads consignação" value={leads} highlight />
      </div>

      <h2 className="font-display mt-12 text-2xl font-black uppercase text-white">
        Ações rápidas
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Action href="/admin/clientes/novo" title="Novo cliente" desc="Cadastrar comprador, vendedor ou consignante." />
        <Action href="/admin/estoque/novo" title="Adicionar veículo" desc="Inserir um carro no estoque do site." />
        <Action href="/admin/documentos/novo" title="Gerar documento" desc="Procuração, contrato, consignação, residência." />
        <Action href="/admin/estoque" title="Gerir estoque" desc="Editar, remover e destacar veículos." />
        <Action href="/admin/clientes" title="Ver clientes" desc="Buscar e editar cadastros." />
        <Action href="/admin/consignacao" title="Consignação" desc="Leads e veículos de terceiros." />
      </div>

      <p className="mt-10 text-xs text-[var(--color-mute)]">
        Documentos gerados: {docs ?? "—"}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-5 ${
        highlight
          ? "border-[var(--color-red)]/40 bg-[var(--color-red)]/10"
          : "border-white/12 bg-[var(--color-panel)]"
      }`}
    >
      <p className="font-display text-4xl font-black text-white">
        {value ?? "—"}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--color-mute)]">
        {label}
      </p>
    </div>
  );
}

function Action({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group border border-white/12 bg-[var(--color-panel)] p-5 transition-colors hover:border-[var(--color-red)]"
    >
      <h3 className="font-display text-xl font-black uppercase text-white">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--color-mute)]">{desc}</p>
      <span className="mt-3 inline-block text-sm font-bold uppercase text-[var(--color-red)] opacity-0 transition-opacity group-hover:opacity-100">
        Abrir →
      </span>
    </Link>
  );
}
