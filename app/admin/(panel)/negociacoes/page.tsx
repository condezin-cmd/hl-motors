import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { brl } from "@/lib/format";

const statusCls: Record<string, string> = {
  aberta: "bg-amber-400 text-black",
  fechada: "bg-emerald-500 text-white",
  cancelada: "bg-zinc-600 text-white",
};
const statusLabel: Record<string, string> = { aberta: "Aberta", fechada: "Fechada", cancelada: "Cancelada" };

export default async function NegociacoesPage() {
  const sb = await createReadClient();
  const { data: negs, error } = await sb.from("negociacoes").select("*").order("created_at", { ascending: false });
  const ids = new Set<string>();
  (negs ?? []).forEach((n) => { if (n.comprador_id) ids.add(n.comprador_id); });
  const veiIds = new Set<string>();
  (negs ?? []).forEach((n) => { if (n.veiculo_id) veiIds.add(n.veiculo_id); });

  const [{ data: clientes }, { data: veiculos }] = await Promise.all([
    ids.size ? sb.from("clientes").select("id, nome").in("id", [...ids]) : Promise.resolve({ data: [] as any[] }),
    veiIds.size ? sb.from("veiculos").select("id, marca, modelo, ano_modelo").in("id", [...veiIds]) : Promise.resolve({ data: [] as any[] }),
  ]);
  const cMap = new Map((clientes ?? []).map((c) => [c.id, c.nome]));
  const vMap = new Map((veiculos ?? []).map((v) => [v.id, `${v.marca} ${v.modelo} ${v.ano_modelo ?? ""}`.trim()]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Negociações</h1>
          <p className="mt-1 text-[var(--color-mute)]">Cada venda em um lugar: comprador, carro, troca, pagamento e documentos.</p>
        </div>
        <Link href="/admin/negociacoes/novo" className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]">
          + Nova negociação
        </Link>
      </div>

      {error ? (
        <p className="mt-8 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">⚠️ {error.message}</p>
      ) : !negs?.length ? (
        <p className="mt-8 text-[var(--color-mute)]">Nenhuma negociação ainda. Clique em “Nova negociação”.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
              <tr>
                <th className="px-4 py-3">Comprador</th>
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3">Troca</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {negs.map((n) => (
                <tr key={n.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-bold text-white">{cMap.get(n.comprador_id) ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{vMap.get(n.veiculo_id) ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{n.tem_troca ? "Sim" : "—"}</td>
                  <td className="px-4 py-3 font-black text-[var(--color-red)]">{brl(n.valor ?? 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase ${statusCls[n.status] ?? "bg-zinc-600 text-white"}`}>
                      {statusLabel[n.status] ?? n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/negociacoes/${n.id}`} className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)]">
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
