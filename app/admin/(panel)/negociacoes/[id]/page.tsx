import Link from "next/link";
import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { brl } from "@/lib/format";
import { COMISSAO_CONSIGNACAO } from "@/lib/docs/templates";
import { DocDownloads } from "@/components/admin/DocDownloads";
import { setNegociacaoStatus, deleteNegociacao, gerarDocNegociacao } from "../actions";

const statusLabel: Record<string, string> = { aberta: "Aberta", fechada: "Fechada", cancelada: "Cancelada" };

export default async function NegociacaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createReadClient();
  const { data: neg } = await sb.from("negociacoes").select("*").eq("id", id).single();
  if (!neg) notFound();

  const one = (table: string, rid?: string | null) =>
    rid ? sb.from(table).select("*").eq("id", rid).single() : Promise.resolve({ data: null });
  const [comp, vei, prop, aval, trocaProp, docsRes] = await Promise.all([
    one("clientes", neg.comprador_id),
    one("veiculos", neg.veiculo_id),
    one("clientes", neg.proprietario_id),
    one("avaliacoes", neg.avaliacao_id),
    one("clientes", neg.troca_proprietario_id),
    sb.from("documentos").select("*").eq("negociacao_id", id).order("created_at", { ascending: false }),
  ]);
  const comprador = comp.data;
  const veiculo = vei.data;
  const docs = docsRes.data ?? [];
  const veiNome = veiculo ? `${veiculo.marca} ${veiculo.modelo} ${veiculo.versao ?? ""}`.trim() : "—";

  const pagamentos: any[] = Array.isArray(neg.pagamentos) ? neg.pagamentos : [];

  return (
    <div className="max-w-4xl">
      <Link href="/admin/negociacoes" className="text-sm font-semibold uppercase text-[var(--color-mute)] hover:text-white">← Negociações</Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">{comprador?.nome ?? "Comprador —"}</h1>
          <p className="mt-1 text-[var(--color-mute)]">{veiNome} · <span className="font-black text-[var(--color-red)]">{brl(neg.valor ?? 0)}</span></p>
        </div>
        <span className="bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-white">{statusLabel[neg.status] ?? neg.status}</span>
      </div>

      {/* Status + ações */}
      <div className="mt-5 flex flex-wrap gap-2">
        {neg.status !== "fechada" && (
          <form action={setNegociacaoStatus.bind(null, id, "fechada")}>
            <button className="border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-500/20">✓ Marcar como fechada</button>
          </form>
        )}
        {neg.status !== "aberta" && (
          <form action={setNegociacaoStatus.bind(null, id, "aberta")}>
            <button className="border border-white/15 px-4 py-2 text-xs font-black uppercase text-[var(--color-mute)] hover:border-white/40">Reabrir</button>
          </form>
        )}
        {neg.status !== "cancelada" && (
          <form action={setNegociacaoStatus.bind(null, id, "cancelada")}>
            <button className="border border-white/15 px-4 py-2 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">Cancelar</button>
          </form>
        )}
        <Link href={`/admin/negociacoes/editar/${id}`} className="border border-white/15 px-4 py-2 text-xs font-black uppercase text-white hover:border-[var(--color-red)]">Editar</Link>
        <form action={deleteNegociacao.bind(null, id)}>
          <button className="border border-white/15 px-4 py-2 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">Excluir</button>
        </form>
      </div>

      {/* Resumo */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Card title="Comprador">{comprador?.nome ?? "—"}{comprador?.cpf ? ` · CPF ${comprador.cpf}` : ""}</Card>
        <Card title="Veículo vendido">{veiNome}{veiculo?.placa ? ` · ${veiculo.placa}` : ""}</Card>
        <Card title="Proprietário do veículo">{prop.data ? `${prop.data.nome} (terceiro / consignado)` : "A própria loja"}</Card>
        <Card title="Troca">
          {neg.tem_troca
            ? `${aval.data ? `${aval.data.marca ?? ""} ${aval.data.modelo ?? ""}`.trim() : "carro avaliado"}${trocaProp.data ? ` · dono: ${trocaProp.data.nome}` : ""}`
            : "Sem troca"}
        </Card>
      </div>

      {prop.data && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="border border-white/12 bg-black/20 p-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">Comissão da empresa (consignado)</h3>
            <p className="mt-1 font-display text-2xl font-black text-[var(--color-red)]">{brl(COMISSAO_CONSIGNACAO)}</p>
          </div>
          <div className="border border-white/12 bg-black/20 p-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">Repasse ao proprietário</h3>
            <p className="mt-1 font-display text-2xl font-black text-white">{brl(Math.max((Number(neg.valor) || 0) - COMISSAO_CONSIGNACAO, 0))}</p>
            <p className="mt-0.5 text-xs text-[var(--color-mute)]">{prop.data.nome}</p>
          </div>
        </div>
      )}

      {pagamentos.length > 0 && (
        <div className="mt-4 border border-white/12 bg-black/20 p-4">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">Pagamento</h3>
          <ul className="mt-2 space-y-1 text-sm text-white">
            {pagamentos.map((p, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>{p.tipo}{p.descricao ? ` — ${p.descricao}` : ""}</span>
                <span className="font-bold">{p.valor ? brl(Number(p.valor)) : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {neg.observacoes && <p className="mt-4 text-sm text-[var(--color-mute)]">{neg.observacoes}</p>}

      {/* Documentos */}
      <h2 className="font-display mt-10 text-2xl font-black uppercase text-[var(--color-red)]">Documentos</h2>
      <p className="mt-1 text-sm text-[var(--color-mute)]">Gerados já preenchidos com os dados desta negociação.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Gerar id={id} tipo="contrato" label="Gerar contrato de compra e venda" />
        {neg.proprietario_id && <Gerar id={id} tipo="procuracao" label="Gerar procuração do veículo vendido" />}
        {neg.tem_troca && neg.avaliacao_id && <Gerar id={id} tipo="procuracao_troca" label="Gerar procuração da troca" />}
        <Gerar id={id} tipo="declaracao_residencia" label="Gerar declaração de residência" />
      </div>

      {docs.length > 0 && (
        <div className="mt-6 divide-y divide-white/10 border border-white/10">
          {docs.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div>
                <p className="text-sm font-bold text-white">{d.titulo ?? d.tipo}</p>
                <p className="text-xs text-[var(--color-mute)]">{new Date(d.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <DocDownloads pdf={d.pdf_path} docx={d.docx_path} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/12 bg-black/20 p-4">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-white">{children}</p>
    </div>
  );
}

function Gerar({ id, tipo, label }: { id: string; tipo: string; label: string }) {
  return (
    <form action={gerarDocNegociacao.bind(null, id, tipo)}>
      <button className="border border-[var(--color-red)]/50 bg-[var(--color-red)]/10 px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-[var(--color-red)]/20">
        {label}
      </button>
    </form>
  );
}
