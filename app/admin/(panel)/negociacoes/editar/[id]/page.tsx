import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { NegociacaoForm } from "@/components/admin/NegociacaoForm";

export default async function EditarNegociacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createReadClient();
  const [{ data: neg }, { data: clientes }, { data: veiculos }, { data: avals }] = await Promise.all([
    sb.from("negociacoes").select("*").eq("id", id).single(),
    sb.from("clientes").select("id, nome").order("nome"),
    sb.from("veiculos").select("id, marca, modelo, versao, ano_modelo, placa").order("created_at", { ascending: false }),
    sb.from("avaliacoes").select("id, marca, modelo, ano_modelo, placa, valor_avaliado").order("created_at", { ascending: false }),
  ]);
  if (!neg) notFound();

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

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">Editar negociação</h1>
      <div className="mt-8 max-w-3xl">
        <NegociacaoForm id={id} values={neg} clientes={cOpts} veiculos={vOpts} avaliacoes={aOpts} />
      </div>
    </div>
  );
}
