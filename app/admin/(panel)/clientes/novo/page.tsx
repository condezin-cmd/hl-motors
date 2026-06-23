import Link from "next/link";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default async function NovoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; campo?: string }>;
}) {
  const { next, campo } = await searchParams;
  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">
        Novo cliente
      </h1>
      <p className="mt-1 text-[var(--color-mute)]">
        Cadastro usado nos documentos (contrato, procuração, etc.).
      </p>
      {next && (
        <p className="mt-3 inline-flex items-center gap-2 border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-xs font-bold text-white">
          ↩ Ao salvar, você volta para a negociação com este cliente já selecionado.
          <Link href={next} className="underline">cancelar e voltar</Link>
        </p>
      )}
      <div className="mt-8 max-w-4xl">
        <ClienteForm next={next} campo={campo} />
      </div>
    </div>
  );
}
