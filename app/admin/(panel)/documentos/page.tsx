import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { DocDownloads } from "@/components/admin/DocDownloads";
import { deleteDocumento } from "./actions";

const tipoLabel: Record<string, string> = {
  contrato: "Contrato de venda",
  procuracao: "Procuração",
  termo_consignacao: "Termo de consignação",
  declaracao_residencia: "Declaração de residência",
};

export default async function DocumentosPage() {
  const sb = await createReadClient();
  const { data: docs, error } = await sb
    .from("documentos")
    .select("*, clientes(nome)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black uppercase text-white">Documentos</h1>
        <Link href="/admin/documentos/novo" className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]">
          + Gerar documento
        </Link>
      </div>

      {error ? (
        <p className="mt-8 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">⚠️ {error.message}</p>
      ) : !docs?.length ? (
        <p className="mt-8 text-[var(--color-mute)]">Nenhum documento gerado ainda.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Arquivos</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d: any) => (
                <tr key={d.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-bold uppercase text-[var(--color-red)]">
                    {tipoLabel[d.tipo] ?? d.tipo}
                  </td>
                  <td className="px-4 py-3 text-white">{d.titulo}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{d.clientes?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">
                    {new Date(d.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <DocDownloads pdf={d.pdf_path} docx={d.docx_path} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteDocumento.bind(null, d.id, d.pdf_path, d.docx_path)}>
                      <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">
                        Excluir
                      </button>
                    </form>
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
