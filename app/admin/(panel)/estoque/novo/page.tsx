import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { VeiculoForm } from "@/components/admin/VeiculoForm";

export default async function NovoVeiculoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; campo?: string }>;
}) {
  const { next, campo } = await searchParams;
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
      {next && (
        <p className="mt-3 inline-flex items-center gap-2 border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-xs font-bold text-white">
          ↩ Ao salvar, você volta para a negociação com este veículo já selecionado.
          <Link href={next} className="underline">cancelar e voltar</Link>
        </p>
      )}
      <div className="mt-8 max-w-5xl">
        <VeiculoForm clientes={clientes ?? []} next={next} campo={campo} />
      </div>
    </div>
  );
}
