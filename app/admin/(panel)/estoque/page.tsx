import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { EstoqueSocarraoTable } from "@/components/admin/EstoqueSocarraoTable";

export default async function EstoquePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const socarraoStatus = typeof params.socarrao === "string" ? params.socarrao : null;
  const socarraoMessage = typeof params.message === "string" ? params.message : null;
  const created = typeof params.created === "string" ? params.created : "0";
  const updated = typeof params.updated === "string" ? params.updated : "0";
  const mode = typeof params.mode === "string" ? params.mode : null;

  const supabase = await createReadClient();
  const { data: veiculos, error } = await supabase
    .from("veiculos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black uppercase text-white">Estoque</h1>
        <Link href="/admin/estoque/novo" className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]">
          + Adicionar veículo
        </Link>
      </div>

      {socarraoStatus === "ok" && (
        <p className="mt-6 border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          {mode === "queue"
            ? `SóCarrão: ${updated} veículo(s) preparado(s) para envio.`
            : mode === "selected"
              ? `SóCarrão: ${updated} selecionado(s) atualizado(s), ${created} sem vínculo encontrado.`
              : `SóCarrão sincronizado: ${created} novo(s), ${updated} atualizado(s).`}
        </p>
      )}
      {socarraoStatus === "erro" && (
        <p className="mt-6 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          Falha ao sincronizar SóCarrão: {socarraoMessage ?? "verifique as variáveis de ambiente e a migration v4."}
        </p>
      )}

      {error ? (
        <p className="mt-8 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">⚠️ {error.message}</p>
      ) : !veiculos?.length ? (
        <p className="mt-8 text-[var(--color-mute)]">Nenhum veículo no estoque. Clique em “Adicionar veículo”.</p>
      ) : (
        <EstoqueSocarraoTable veiculos={veiculos} />
      )}
    </div>
  );
}
