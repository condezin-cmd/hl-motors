import { createReadClient } from "@/lib/supabase/server";
import { VeiculoForm } from "@/components/admin/VeiculoForm";

export default async function NovoVeiculoPage() {
  const supabase = await createReadClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome")
    .order("nome");

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">
        Adicionar veículo
      </h1>
      <p className="mt-1 text-[var(--color-mute)]">
        Entra no estoque do site e fica disponível para gerar documentos.
      </p>
      <div className="mt-8 max-w-5xl">
        <VeiculoForm clientes={clientes ?? []} />
      </div>
    </div>
  );
}
