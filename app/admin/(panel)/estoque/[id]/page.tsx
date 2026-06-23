import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { VeiculoForm } from "@/components/admin/VeiculoForm";

export default async function EditarVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createReadClient();
  const [{ data: veiculo }, { data: clientes }] = await Promise.all([
    supabase.from("veiculos").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, nome").order("nome"),
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
      </div>
    </div>
  );
}
