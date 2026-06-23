import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createReadClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cliente) notFound();

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">
        Editar cliente
      </h1>
      <p className="mt-1 text-[var(--color-mute)]">{cliente.nome}</p>
      <div className="mt-8 max-w-4xl">
        <ClienteForm id={id} values={cliente} submitLabel="Atualizar cliente" />
      </div>
    </div>
  );
}
