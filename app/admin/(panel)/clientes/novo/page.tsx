import { ClienteForm } from "@/components/admin/ClienteForm";

export default function NovoClientePage() {
  return (
    <div>
      <h1 className="font-display text-4xl font-black uppercase text-white">
        Novo cliente
      </h1>
      <p className="mt-1 text-[var(--color-mute)]">
        Cadastro usado nos documentos (contrato, procuração, etc.).
      </p>
      <div className="mt-8 max-w-4xl">
        <ClienteForm />
      </div>
    </div>
  );
}
