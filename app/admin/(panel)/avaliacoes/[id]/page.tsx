import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { AvaliacaoForm } from "@/components/admin/AvaliacaoForm";

export default async function EditarAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await createReadClient();
  const [{ data: av }, { data: clientes }] = await Promise.all([
    sb.from("avaliacoes").select("*").eq("id", id).single(),
    sb.from("clientes").select("id, nome").order("nome"),
  ]);
  if (!av) notFound();

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">Editar avaliação</h1>
      <p className="mt-1 text-[var(--color-mute)]">{av.marca} {av.modelo}</p>
      <div className="mt-8 max-w-5xl">
        <AvaliacaoForm id={id} values={av} clientes={clientes ?? []} />
      </div>
    </div>
  );
}
