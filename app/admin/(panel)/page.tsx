import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { brl } from "@/lib/format";

const ESTOQUE_VISIVEL = ["disponivel", "reservado", "consignado"];
const statusNeg: Record<string, string> = { aberta: "Aberta", fechada: "Fechada", cancelada: "Cancelada" };
const statusCls: Record<string, string> = {
  aberta: "bg-amber-400 text-black", fechada: "bg-emerald-500 text-white", cancelada: "bg-zinc-600 text-white",
};

async function load() {
  try {
    const sb = await createReadClient();
    const [negsR, veicsR, clientesR, avalR, leadsR, leadsNovosR] = await Promise.all([
      sb.from("negociacoes").select("id, status, valor, created_at, comprador_id").order("created_at", { ascending: false }),
      sb.from("veiculos").select("id, slug, marca, modelo, status, preco, created_at"),
      sb.from("clientes").select("*", { count: "exact", head: true }),
      sb.from("avaliacoes").select("*", { count: "exact", head: true }),
      sb.from("leads_consignacao").select("*", { count: "exact", head: true }).eq("status", "novo"),
      sb.from("leads").select("*", { count: "exact", head: true }).eq("status", "novo"),
    ]);
    return {
      ok: clientesR.error === null,
      negs: negsR.data ?? [],
      veics: veicsR.data ?? [],
      clientes: clientesR.count ?? 0,
      avaliacoes: avalR.count ?? 0,
      leads: leadsR.count ?? 0,
      leadsNovos: leadsNovosR.count ?? 0,
    };
  } catch {
    return { ok: false, negs: [], veics: [], clientes: 0, avaliacoes: 0, leads: 0, leadsNovos: 0 };
  }
}

export default async function Dashboard() {
  const d = await load();
  const num = (x: any) => Number(x) || 0;
  const now = new Date();
  const ini = new Date(now.getFullYear(), now.getMonth(), 1);
  const noMes = (s: string) => new Date(s) >= ini;

  const fechadas = d.negs.filter((n) => n.status === "fechada");
  const abertas = d.negs.filter((n) => n.status === "aberta");
  const fechadasMes = fechadas.filter((n) => noMes(n.created_at));
  const faturamentoMes = fechadasMes.reduce((s, n) => s + num(n.valor), 0);
  const valorAberto = abertas.reduce((s, n) => s + num(n.valor), 0);
  const faturamentoTotal = fechadas.reduce((s, n) => s + num(n.valor), 0);

  const disponiveis = d.veics.filter((v) => ESTOQUE_VISIVEL.includes(v.status));
  const valorEstoque = disponiveis.reduce((s, v) => s + num(v.preco), 0);
  const vendidos = d.veics.filter((v) => v.status === "vendido").length;

  // carros parados: à venda há 60+ dias
  const dias = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  const parados = disponiveis
    .filter((v) => v.created_at && dias(v.created_at) >= 60)
    .map((v) => ({ ...v, d: dias(v.created_at) }))
    .sort((a, b) => b.d - a.d);
  const capitalParado = parados.reduce((s, v) => s + num(v.preco), 0);

  // nomes dos compradores das negociações recentes
  const recentes = d.negs.slice(0, 6);
  const ids = [...new Set(recentes.map((n) => n.comprador_id).filter(Boolean))];
  let nomes = new Map<string, string>();
  if (ids.length) {
    const sb = await createReadClient();
    const { data } = await sb.from("clientes").select("id, nome").in("id", ids);
    nomes = new Map((data ?? []).map((c) => [c.id, c.nome]));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Gestão</h1>
          <p className="mt-1 text-[var(--color-mute)]">Visão geral da loja — {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.</p>
        </div>
        <Link href="/admin/negociacoes/novo" className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]">
          + Nova negociação
        </Link>
      </div>

      {!d.ok && (
        <div className="mt-6 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          ⚠️ Não consegui ler os dados. Verifique a conexão com o banco.
        </div>
      )}

      {d.leadsNovos > 0 && (
        <Link href="/admin/leads" className="mt-6 flex items-center justify-between gap-3 border border-amber-400/50 bg-amber-400/10 p-4 hover:bg-amber-400/[0.15]">
          <span className="text-sm font-black uppercase text-amber-300">◉ {d.leadsNovos} lead(s) novo(s) esperando atendimento</span>
          <span className="text-xs font-black uppercase text-amber-300">Atender agora →</span>
        </Link>
      )}

      {/* linha principal — dinheiro */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Money label="Faturamento do mês" value={faturamentoMes} sub={`${fechadasMes.length} venda(s) fechada(s)`} highlight />
        <Money label="Em aberto" value={valorAberto} sub={`${abertas.length} negociação(ões)`} />
        <Money label="Valor em estoque" value={valorEstoque} sub={`${disponiveis.length} à venda`} />
        <Money label="Faturamento total" value={faturamentoTotal} sub={`${fechadas.length} venda(s) no histórico`} />
      </div>

      {/* linha secundária — contagens */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clientes" value={d.clientes} />
        <Stat label="Avaliações" value={d.avaliacoes} />
        <Stat label="Vendidos (total)" value={vendidos} />
        <Stat label="Leads consignação" value={d.leads} highlight={d.leads > 0} />
      </div>

      {/* carros parados — alerta de gestão */}
      {parados.length > 0 && (
        <div className="mt-8 border border-amber-400/40 bg-amber-400/[0.07] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-black uppercase text-amber-300">⏳ {parados.length} carro(s) parado(s) há +60 dias</h2>
              <p className="mt-1 text-sm text-[var(--color-mute)]">{brl(capitalParado)} de capital parado no pátio. Considere revisar preço ou anunciar em mais portais.</p>
            </div>
            <Link href="/admin/estoque" className="border border-amber-400/50 px-4 py-2 text-xs font-black uppercase text-amber-300 hover:bg-amber-400/10">Ver estoque →</Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {parados.slice(0, 8).map((v) => (
              <Link key={v.id} href={`/admin/estoque/${v.id}`} className="border border-white/12 bg-black/20 px-3 py-1.5 text-xs text-white hover:border-amber-400">
                <span className="font-bold uppercase">{v.marca} {v.modelo}</span>
                <span className="ml-2 font-black text-amber-300">{v.d}d</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* negociações recentes */}
      <div className="mt-12 flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase text-white">Negociações recentes</h2>
        <Link href="/admin/negociacoes" className="text-xs font-black uppercase text-[var(--color-red)] hover:underline">ver todas →</Link>
      </div>
      {recentes.length === 0 ? (
        <p className="mt-4 text-[var(--color-mute)]">Nenhuma negociação ainda. Comece com “Nova negociação”.</p>
      ) : (
        <div className="mt-4 divide-y divide-white/10 border border-white/10">
          {recentes.map((n) => (
            <Link key={n.id} href={`/admin/negociacoes/${n.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.03]">
              <div>
                <p className="font-bold text-white">{nomes.get(n.comprador_id) ?? "Comprador —"}</p>
                <p className="text-xs text-[var(--color-mute)]">{new Date(n.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-[var(--color-red)]">{brl(num(n.valor))}</span>
                <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase ${statusCls[n.status] ?? "bg-zinc-600 text-white"}`}>
                  {statusNeg[n.status] ?? n.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h2 className="font-display mt-12 text-2xl font-black uppercase text-white">Ações rápidas</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Action href="/admin/leads" title="Atender leads" desc="Funil de atendimento — interessados do site e dos portais." />
        <Action href="/admin/negociacoes/novo" title="Nova negociação" desc="Abrir uma venda: comprador, carro, troca e documentos." />
        <Action href="/admin/estoque/novo" title="Adicionar veículo" desc="Inserir um carro no estoque do site." />
        <Action href="/admin/clientes/novo" title="Novo cliente" desc="Cadastrar comprador, vendedor ou consignante." />
        <Action href="/admin/estoque" title="Gerir estoque" desc="Editar, inativar, destacar e ver no site." />
        <Action href="/admin/avaliacoes" title="Avaliações" desc="Carros para troca, com valor avaliado." />
        <Action href="/admin/documentos" title="Documentos" desc="Contratos, procurações, declarações." />
      </div>
    </div>
  );
}

function Money({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`border p-5 ${highlight ? "border-[var(--color-red)]/50 bg-[var(--color-red)]/10" : "border-white/12 bg-[var(--color-panel)]"}`}>
      <p className="text-[11px] font-black uppercase tracking-wide text-[var(--color-mute)]">{label}</p>
      <p className="font-display mt-1 text-3xl font-black text-white">{brl(value)}</p>
      {sub && <p className="mt-1 text-xs text-[var(--color-mute)]">{sub}</p>}
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div className={`border p-5 ${highlight ? "border-[var(--color-red)]/40 bg-[var(--color-red)]/10" : "border-white/12 bg-[var(--color-panel)]"}`}>
      <p className="font-display text-4xl font-black text-white">{value ?? "—"}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--color-mute)]">{label}</p>
    </div>
  );
}
function Action({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group border border-white/12 bg-[var(--color-panel)] p-5 transition-colors hover:border-[var(--color-red)]">
      <h3 className="font-display text-xl font-black uppercase text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--color-mute)]">{desc}</p>
    </Link>
  );
}
