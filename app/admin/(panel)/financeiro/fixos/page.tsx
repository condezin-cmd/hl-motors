import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { brl } from "@/lib/format";
import { createGastoFixo, toggleGastoFixo, deleteGastoFixo, lancarFixosDoMes } from "./actions";

export default async function GastosFixosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; comp?: string; erro?: string }>;
}) {
  const { ok, comp, erro } = await searchParams;
  const sb = await createReadClient();
  const { data: fixos } = await sb.from("gastos_fixos").select("*").order("ativo", { ascending: false }).order("nome");
  const lista = fixos ?? [];
  const totalMensal = lista.filter((f) => f.ativo).reduce((s, f) => s + (Number(f.valor) || 0), 0);
  const compAtual = new Date().toISOString().slice(0, 7);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/financeiro" className="text-sm font-semibold uppercase text-[var(--color-mute)] hover:text-white">← Financeiro</Link>
      <h1 className="font-display mt-3 text-4xl font-black uppercase text-white">Gastos fixos</h1>
      <p className="mt-1 text-[var(--color-mute)]">Despesas que se repetem todo mês (aluguel, energia, salários…). Cadastre uma vez e lance no caixa com um clique.</p>

      {ok && <p className="mt-5 border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-200">✓ {ok} gasto(s) fixo(s) lançado(s) no caixa (competência {comp}). {ok === "0" && "Nada novo — já estavam lançados este mês."}</p>}
      {erro && <p className="mt-5 border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 p-4 text-sm text-[var(--color-red-bright)]">{erro}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-[var(--color-red)]/40 bg-[var(--color-red)]/[0.06] p-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-[var(--color-mute)]">Total mensal (ativos)</p>
          <p className="font-display text-3xl font-black text-white">{brl(totalMensal)}</p>
        </div>
        <form action={lancarFixosDoMes} className="flex items-end gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[var(--color-mute)]">Mês (competência)</label>
            <input type="month" name="competencia" defaultValue={compAtual} className="border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]" />
          </div>
          <button className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]">
            Lançar fixos
          </button>
        </form>
      </div>

      {/* cadastrar novo */}
      <form action={createGastoFixo} className="mt-8 border border-white/12 bg-black/20 p-5">
        <h2 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-red)]">Novo gasto fixo</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
          <Field name="nome" label="Nome" placeholder="Aluguel, Energia, Salário…" required />
          <Field name="valor" label="Valor (R$)" type="number" required />
          <Field name="dia_vencimento" label="Dia venc." type="number" placeholder="1-31" />
          <button type="submit" className="bg-[var(--color-red)] px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-[var(--color-red-bright)]">Adicionar</button>
        </div>
      </form>

      {/* lista */}
      {lista.length === 0 ? (
        <p className="mt-8 text-[var(--color-mute)]">Nenhum gasto fixo cadastrado ainda.</p>
      ) : (
        <div className="mt-6 divide-y divide-white/10 border border-white/10">
          {lista.map((f) => (
            <div key={f.id} className={`flex flex-wrap items-center justify-between gap-3 p-4 ${f.ativo ? "" : "opacity-50"}`}>
              <div>
                <p className="font-bold text-white">{f.nome}</p>
                <p className="text-xs text-[var(--color-mute)]">{f.dia_vencimento ? `vence dia ${f.dia_vencimento}` : "sem dia fixo"}{f.observacao ? ` · ${f.observacao}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-[var(--color-red)]">{brl(Number(f.valor) || 0)}</span>
                <form action={toggleGastoFixo.bind(null, f.id, !f.ativo)}>
                  <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-amber-400 hover:text-amber-300">
                    {f.ativo ? "Pausar" : "Ativar"}
                  </button>
                </form>
                <form action={deleteGastoFixo.bind(null, f.id)}>
                  <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">Excluir</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ name, label, type = "text", placeholder, required }: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">{label}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} step={type === "number" ? "0.01" : undefined}
        className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-red)]" />
    </div>
  );
}
