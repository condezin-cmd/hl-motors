import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { brl, km as fmtKm } from "@/lib/format";
import { deleteVeiculo } from "./actions";

const statusLabel: Record<string, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  consignado: "Consignado",
};

export default async function EstoquePage() {
  const supabase = await createReadClient();
  const { data: veiculos, error } = await supabase
    .from("veiculos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black uppercase text-white">Estoque</h1>
        <Link href="/admin/estoque/novo" className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]">
          + Adicionar veículo
        </Link>
      </div>

      {error ? (
        <p className="mt-8 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">⚠️ {error.message}</p>
      ) : !veiculos?.length ? (
        <p className="mt-8 text-[var(--color-mute)]">Nenhum veículo no estoque. Clique em “Adicionar veículo”.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
              <tr>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3">Ano</th>
                <th className="px-4 py-3">KM</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((c) => (
                <tr key={c.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="h-12 w-16 overflow-hidden border border-white/10 bg-black/40">
                      {c.fotos?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.fotos[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold uppercase text-white">{c.marca} {c.modelo}</p>
                    <p className="text-xs text-[var(--color-mute)]">{c.versao}</p>
                    {c.destaque && <span className="text-[10px] font-black uppercase text-[var(--color-red)]">★ destaque</span>}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{c.ano_modelo ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{c.km != null ? fmtKm(c.km) : "—"}</td>
                  <td className="px-4 py-3 font-black text-[var(--color-red)]">{brl(c.preco ?? 0)}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{statusLabel[c.status] ?? c.status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/estoque/${c.id}`} className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)]">Editar</Link>
                      <form action={deleteVeiculo.bind(null, c.id)}>
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
