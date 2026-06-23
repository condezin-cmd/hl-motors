import { createReadClient } from "@/lib/supabase/server";
import { NegociacaoForm } from "@/components/admin/NegociacaoForm";

async function opcoes() {
  const sb = await createReadClient();
  const [{ data: clientes }, { data: veiculos }, { data: avals }] = await Promise.all([
    sb.from("clientes").select("id, nome").order("nome"),
    sb.from("veiculos").select("id, marca, modelo, versao, ano_modelo, placa").order("created_at", { ascending: false }),
    sb.from("avaliacoes").select("id, marca, modelo, ano_modelo, placa, valor_avaliado").order("created_at", { ascending: false }),
  ]);
  const cOpts = (clientes ?? []).map((c) => ({ id: c.id, label: c.nome }));
  const vOpts = (veiculos ?? []).map((v) => ({
    id: v.id,
    label: `${v.marca} ${v.modelo} ${v.versao ?? ""} ${v.ano_modelo ?? ""}${v.placa ? " · " + v.placa : ""}`.replace(/\s+/g, " ").trim(),
  }));
  const aOpts = (avals ?? []).map((a) => ({
    id: a.id,
    label: `${a.marca ?? ""} ${a.modelo ?? ""} ${a.ano_modelo ?? ""}${a.placa ? " · " + a.placa : ""}`.replace(/\s+/g, " ").trim(),
    valor: a.valor_avaliado,
    placa: a.placa,
  }));
  return { cOpts, vOpts, aOpts };
}

export default async function NovaNegociacaoPage() {
  const { cOpts, vOpts, aOpts } = await opcoes();
  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">Nova negociação</h1>
      <p className="mt-1 text-[var(--color-mute)]">Comprador, veículo, troca e pagamentos. Os documentos saem depois, já preenchidos.</p>
      {!cOpts.length || !vOpts.length ? (
        <p className="mt-6 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          Cadastre ao menos um cliente e um veículo antes de abrir uma negociação.
        </p>
      ) : null}
      <div className="mt-8 max-w-3xl">
        <NegociacaoForm clientes={cOpts} veiculos={vOpts} avaliacoes={aOpts} />
      </div>
    </div>
  );
}
