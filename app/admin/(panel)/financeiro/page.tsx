import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { brl } from "@/lib/format";
import { catByKey, catLabel } from "@/lib/financeiro";
import { deleteLancamento } from "./actions";

export default async function FinanceiroPage() {
  const sb = await createReadClient();
  const { data: lancs, error } = await sb.from("lancamentos").select("*").order("data", { ascending: false }).order("created_at", { ascending: false });
  const L = lancs ?? [];

  const num = (x: any) => Number(x) || 0;
  const now = new Date();
  const ini = new Date(now.getFullYear(), now.getMonth(), 1);
  const noMes = (s: string) => new Date(s + "T00:00:00") >= ini;

  const entradasTotal = L.filter((l) => l.tipo === "entrada").reduce((s, l) => s + num(l.valor), 0);
  const saidasTotal = L.filter((l) => l.tipo === "saida").reduce((s, l) => s + num(l.valor), 0);
  const saldo = entradasTotal - saidasTotal;
  const entradasMes = L.filter((l) => l.tipo === "entrada" && noMes(l.data)).reduce((s, l) => s + num(l.valor), 0);
  const saidasMes = L.filter((l) => l.tipo === "saida" && noMes(l.data)).reduce((s, l) => s + num(l.valor), 0);

  // nomes dos veículos vinculados
  const veiIds = [...new Set(L.map((l) => l.veiculo_id).filter(Boolean))];
  let vMap = new Map<string, string>();
  if (veiIds.length) {
    const { data } = await sb.from("veiculos").select("id, marca, modelo").in("id", veiIds);
    vMap = new Map((data ?? []).map((v) => [v.id, `${v.marca} ${v.modelo}`]));
  }

  // agrupa por mês (competência da data)
  const grupos = new Map<string, typeof L>();
  for (const l of L) {
    const ym = String(l.data || "").slice(0, 7);
    if (!grupos.has(ym)) grupos.set(ym, []);
    grupos.get(ym)!.push(l);
  }
  const meses = [...grupos.keys()].sort().reverse();
  const mesLabel = (ym: string) => {
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Financeiro</h1>
          <p className="mt-1 text-[var(--color-mute)]">Livro caixa da loja — entradas, saídas e saldo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/financeiro/fixos" className="border border-white/15 px-5 py-3 text-sm font-black uppercase text-white hover:border-[var(--color-red)]">
            Gastos fixos
          </Link>
          <Link href="/admin/financeiro/novo" className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]">
            + Novo lançamento
          </Link>
        </div>
      </div>

      {error && <p className="mt-6 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">⚠️ {error.message}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Saldo em caixa" value={saldo} tone={saldo >= 0 ? "pos" : "neg"} big />
        <Card label="Entradas do mês" value={entradasMes} tone="pos" />
        <Card label="Saídas do mês" value={saidasMes} tone="neg" />
        <Card label="Resultado do mês" value={entradasMes - saidasMes} tone={entradasMes - saidasMes >= 0 ? "pos" : "neg"} />
      </div>

      <h2 className="font-display mt-10 text-2xl font-black uppercase text-white">Lançamentos por mês</h2>
      {L.length === 0 ? (
        <p className="mt-4 text-[var(--color-mute)]">Nenhum lançamento ainda. Clique em “Novo lançamento”.</p>
      ) : (
        <div className="mt-4 space-y-8">
          {meses.map((ym) => {
            const itens = grupos.get(ym)!;
            const ent = itens.filter((l) => l.tipo === "entrada").reduce((s, l) => s + num(l.valor), 0);
            const sai = itens.filter((l) => l.tipo === "saida").reduce((s, l) => s + num(l.valor), 0);
            return (
              <div key={ym}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--color-red)] pb-2">
                  <h3 className="font-display text-xl font-black uppercase text-white">{mesLabel(ym)}</h3>
                  <div className="flex gap-4 text-xs font-black uppercase">
                    <span className="text-emerald-400">+ {brl(ent)}</span>
                    <span className="text-[var(--color-red-bright)]">− {brl(sai)}</span>
                    <span className={ent - sai >= 0 ? "text-white" : "text-[var(--color-red-bright)]"}>= {brl(ent - sai)}</span>
                  </div>
                </div>
                <div className="mt-2 overflow-x-auto border border-white/10">
                  <table className="w-full text-sm">
                    <tbody>
                      {itens.map((l) => {
                        const entrada = l.tipo === "entrada";
                        return (
                          <tr key={l.id} className="border-t border-white/10 first:border-t-0 hover:bg-white/[0.03]">
                            <td className="whitespace-nowrap px-4 py-3 text-[var(--color-mute)]">{new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                            <td className="px-4 py-3"><span className="font-bold text-white">{catLabel(l.categoria)}</span>{l.auto && <span className="ml-2 text-[10px] font-black uppercase text-emerald-300">auto</span>}</td>
                            <td className="px-4 py-3 text-[var(--color-mute)]">{[l.veiculo_id ? vMap.get(l.veiculo_id) : null, l.socio, l.descricao, l.forma_pagamento].filter(Boolean).join(" · ") || "—"}</td>
                            <td className={`whitespace-nowrap px-4 py-3 text-right font-black ${entrada ? "text-emerald-400" : "text-[var(--color-red-bright)]"}`}>{entrada ? "+" : "−"} {brl(num(l.valor))}</td>
                            <td className="px-4 py-3 text-right">
                              <form action={deleteLancamento.bind(null, l.id)}>
                                <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">Excluir</button>
                              </form>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Card({ label, value, tone, big }: { label: string; value: number; tone: "pos" | "neg"; big?: boolean }) {
  return (
    <div className={`border p-5 ${big ? "border-[var(--color-red)]/50 bg-[var(--color-red)]/10" : "border-white/12 bg-[var(--color-panel)]"}`}>
      <p className="text-[11px] font-black uppercase tracking-wide text-[var(--color-mute)]">{label}</p>
      <p className={`font-display mt-1 text-3xl font-black ${tone === "pos" ? "text-white" : "text-[var(--color-red-bright)]"}`}>{brl(value)}</p>
    </div>
  );
}
