import { createReadClient } from "@/lib/supabase/server";
import { AvaliacaoForm } from "@/components/admin/AvaliacaoForm";

export default async function NovaAvaliacaoPage() {
  const sb = await createReadClient();
  const { data: clientes } = await sb.from("clientes").select("id, nome").order("nome");
  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">Nova avaliação</h1>
      <p className="mt-1 text-[var(--color-mute)]">
        Registre o carro e o valor avaliado para considerá-lo na negociação.
      </p>
      <div className="mt-8 max-w-5xl">
        <AvaliacaoForm clientes={clientes ?? []} />
      </div>
    </div>
  );
}
