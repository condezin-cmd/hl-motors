import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { brl } from "@/lib/format";
import { deleteAvaliacao } from "./actions";

const statusLabel: Record<string, string> = {
  avaliado: "Avaliado",
  aceito: "Aceito",
  recusado: "Recusado",
  usado: "Usado em venda",
};

export default async function AvaliacoesPage() {
  const sb = await createReadClient();
  const { data: avs, error } = await sb
    .from("avaliacoes")
    .select("*, clientes(nome)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Avaliações</h1>
          <p className="mt-1 text-[var(--color-mute)]">
            Carros avaliados para entrar como parte de pagamento (troca).
          </p>
        </div>
        <Link href="/admin/avaliacoes/novo" className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]">
          + Nova avaliação
        </Link>
      </div>

      {error ? (
        <p className="mt-8 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          ⚠️ {error.message} — rode o <strong>schema_v3.sql</strong> no Supabase.
        </p>
      ) : !avs?.length ? (
        <p className="mt-8 text-[var(--color-mute)]">Nenhuma avaliação registrada.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
              <tr>
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Placa</th>
                <th className="px-4 py-3">Avaliado</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {avs.map((a: any) => (
                <tr key={a.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-bold uppercase text-white">{a.marca} {a.modelo}</p>
                    <p className="text-xs text-[var(--color-mute)]">{a.versao} {a.ano_modelo ? `· ${a.ano_modelo}` : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{a.clientes?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{a.placa ?? "—"}</td>
                  <td className="px-4 py-3 font-black text-[var(--color-red)]">{a.valor_avaliado != null ? brl(a.valor_avaliado) : "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{statusLabel[a.status] ?? a.status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/avaliacoes/${a.id}`} className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)]">Editar</Link>
                      <form action={deleteAvaliacao.bind(null, a.id)}>
                        <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">Excluir</button>
                      </form>
                    </div>
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
