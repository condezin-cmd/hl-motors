import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { deleteCliente } from "./actions";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createReadClient();

  let query = supabase.from("clientes").select("*").order("nome");
  if (q) query = query.or(`nome.ilike.%${q}%,cpf.ilike.%${q}%,telefone.ilike.%${q}%`);
  const { data: clientes, error } = await query;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black uppercase text-white">Clientes</h1>
        <Link
          href="/admin/clientes/novo"
          className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]"
        >
          + Novo cliente
        </Link>
      </div>

      <form className="mt-6 flex gap-2" action="/admin/clientes">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome, CPF ou telefone..."
          className="w-full max-w-md border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
        />
        <button className="border border-white/15 px-5 text-sm font-black uppercase text-white hover:border-white/40">
          Buscar
        </button>
      </form>

      {error ? (
        <p className="mt-8 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          ⚠️ Não foi possível carregar (rode o schema.sql no Supabase). {error.message}
        </p>
      ) : !clientes?.length ? (
        <p className="mt-8 text-[var(--color-mute)]">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Cidade</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-semibold text-white">{c.nome}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{c.cpf ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{c.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">
                    {c.cidade ? `${c.cidade}/${c.uf ?? ""}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)]"
                      >
                        Editar
                      </Link>
                      <form action={deleteCliente.bind(null, c.id)}>
                        <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">
                          Excluir
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
