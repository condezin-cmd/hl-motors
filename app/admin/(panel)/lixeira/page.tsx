import { createReadClient } from "@/lib/supabase/server";
import { LIXEIRA_LABELS } from "@/lib/lixeira";
import { restaurarItem, excluirItem } from "./actions";

export const dynamic = "force-dynamic";

function quando(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function LixeiraPage() {
  const sb = await createReadClient();
  const { data, error } = await sb.from("lixeira").select("*").order("deleted_at", { ascending: false });
  const itens = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Lixeira</h1>
          <p className="mt-1 text-[var(--color-mute)]">Tudo que você exclui vem parar aqui. Dá pra restaurar ou apagar de vez.</p>
        </div>
        {itens.length > 0 && <span className="text-xs font-black uppercase text-[var(--color-mute)]">{itens.length} item(ns)</span>}
      </div>

      {error && <p className="mt-6 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">⚠️ {error.message}</p>}

      {itens.length === 0 ? (
        <p className="mt-10 border border-white/10 py-16 text-center text-[var(--color-mute)]">
          A lixeira está vazia. 🧹
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Excluído em</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((it) => (
                <tr key={it.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <span className="inline-flex bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase text-white">
                      {LIXEIRA_LABELS[it.tabela] ?? it.tabela}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-white">{it.rotulo || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--color-mute)]">{quando(it.deleted_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <form action={restaurarItem.bind(null, it.id)}>
                        <button className="border border-emerald-400/40 px-3 py-1.5 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-400/10">
                          ↩ Restaurar
                        </button>
                      </form>
                      <form action={excluirItem.bind(null, it.id)}>
                        <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">
                          Excluir de vez
                        </button>
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
