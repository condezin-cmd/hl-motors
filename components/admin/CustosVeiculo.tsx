import { brl } from "@/lib/format";
import { catLabel } from "@/lib/financeiro";
import { addCustoVeiculo, removeCustoVeiculo } from "@/app/admin/(panel)/estoque/actions";

type Custo = { id: string; categoria: string; valor: number; descricao: string | null; data: string };

export function CustosVeiculo({ veiculoId, preco, custos }: { veiculoId: string; preco: number; custos: Custo[] }) {
  const totalCusto = custos.reduce((s, c) => s + (Number(c.valor) || 0), 0);
  const margem = (Number(preco) || 0) - totalCusto;

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <h3 className="font-display text-lg font-black uppercase text-[var(--color-red)]">Custos e agregados do veículo</h3>
      <p className="mb-4 mt-1 text-xs text-[var(--color-mute)]">
        Custo de aquisição + reparos/gastos previstos. Cada item também aparece no Financeiro como saída.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Box label="Investido no carro" value={brl(totalCusto)} tone="neg" />
        <Box label="Preço de venda" value={brl(Number(preco) || 0)} />
        <Box label="Margem prevista" value={brl(margem)} tone={margem >= 0 ? "pos" : "neg"} />
      </div>

      {custos.length > 0 && (
        <div className="mt-4 divide-y divide-white/10 border border-white/10">
          {custos.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-sm font-bold text-white">{catLabel(c.categoria)}{c.descricao ? ` — ${c.descricao}` : ""}</p>
                <p className="text-xs text-[var(--color-mute)]">{new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-[var(--color-red-bright)]">− {brl(Number(c.valor) || 0)}</span>
                <form action={removeCustoVeiculo.bind(null, c.id, veiculoId)}>
                  <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">Excluir</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={addCustoVeiculo.bind(null, veiculoId)} className="mt-4 border border-white/12 bg-black/20 p-4">
        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">Adicionar custo / agregado</p>
        <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end">
          <div>
            <Mini>Tipo</Mini>
            <select name="categoria" defaultValue="reparo" className="w-full border border-white/15 bg-[var(--color-graphite)] px-2.5 py-2 text-sm text-white outline-none focus:border-[var(--color-red)]">
              <option value="reparo">Reparo / agregado</option>
              <option value="custo_veiculo">Custo de aquisição</option>
            </select>
          </div>
          <div>
            <Mini>Valor (R$)</Mini>
            <input name="valor" type="number" step="0.01" className="w-full border border-white/15 bg-black/30 px-2.5 py-2 text-sm text-white outline-none focus:border-[var(--color-red)]" />
          </div>
          <div>
            <Mini>Descrição</Mini>
            <input name="descricao" placeholder="Pneus, funilaria…" className="w-full border border-white/15 bg-black/30 px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-red)]" />
          </div>
          <button type="submit" className="bg-[var(--color-red)] px-4 py-2 text-xs font-black uppercase text-white hover:bg-[var(--color-red-bright)]">Adicionar</button>
        </div>
      </form>
    </div>
  );
}

function Box({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" }) {
  return (
    <div className="border border-white/12 bg-[var(--color-panel)] p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-[var(--color-mute)]">{label}</p>
      <p className={`font-display mt-1 text-2xl font-black ${tone === "neg" ? "text-[var(--color-red-bright)]" : tone === "pos" ? "text-emerald-400" : "text-white"}`}>{value}</p>
    </div>
  );
}
function Mini({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[var(--color-mute)]">{children}</label>;
}
