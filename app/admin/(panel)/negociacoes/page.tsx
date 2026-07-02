import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { NegociacoesTable, type NegRow } from "@/components/admin/NegociacoesTable";

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

  const rows: NegRow[] = (negs ?? []).map((n) => ({
    id: n.id,
    comprador: cMap.get(n.comprador_id) ?? "—",
    veiculo: vMap.get(n.veiculo_id) ?? "—",
    temTroca: !!n.tem_troca,
    valor: Number(n.valor) || 0,
    status: n.status,
  }));

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
        <NegociacoesTable rows={rows} />
      )}
    </div>
  );
}
