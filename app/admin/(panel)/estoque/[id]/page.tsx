import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { VeiculoForm } from "@/components/admin/VeiculoForm";
import { CustosVeiculo } from "@/components/admin/CustosVeiculo";

export default async function EditarVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createReadClient();
  const [{ data: veiculo }, { data: clientes }, { data: custos }] = await Promise.all([
    supabase.from("veiculos").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, nome").order("nome"),
    supabase.from("lancamentos").select("id, categoria, valor, descricao, data")
      .eq("veiculo_id", id).in("categoria", ["custo_veiculo", "reparo"]).order("data", { ascending: false }),
  ]);

  if (!veiculo) notFound();

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">
        Editar veículo
      </h1>
      <p className="mt-1 text-[var(--color-mute)]">
        {veiculo.marca} {veiculo.modelo}
      </p>
      <div className="mt-8 max-w-5xl">
        <VeiculoForm id={id} values={veiculo} clientes={clientes ?? []} />
        <CustosVeiculo veiculoId={id} preco={Number(veiculo.preco) || 0} custos={(custos ?? []) as any} />
      </div>
    </div>
  );
}
