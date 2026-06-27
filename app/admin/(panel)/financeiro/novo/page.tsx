import { createReadClient } from "@/lib/supabase/server";
import { LancamentoForm } from "@/components/admin/LancamentoForm";

export default async function NovoLancamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const sb = await createReadClient();
  const { data: veiculos } = await sb
    .from("veiculos")
    .select("id, marca, modelo, ano_modelo, placa")
    .order("created_at", { ascending: false });
  const vOpts = (veiculos ?? []).map((v) => ({
    id: v.id,
    label: `${v.marca} ${v.modelo} ${v.ano_modelo ?? ""}${v.placa ? " · " + v.placa : ""}`.replace(/\s+/g, " ").trim(),
  }));

  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">Novo lançamento</h1>
      <p className="mt-1 text-[var(--color-mute)]">Entrada ou saída do caixa da loja.</p>
      <div className="mt-8">
        <LancamentoForm veiculos={vOpts} categoriaInicial={categoria} />
      </div>
    </div>
  );
}
