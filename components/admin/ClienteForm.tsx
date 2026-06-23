"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { FileUploader } from "@/components/admin/FileUploader";
import { DocImport } from "@/components/admin/DocImport";
import { fillForm } from "@/lib/admin/fill-form";
import { createCliente, updateCliente } from "@/app/admin/(panel)/clientes/actions";

const CLIENTE_LABELS: Record<string, string> = {
  nome: "Nome", cpf: "CPF", rg: "RG", orgao_emissor: "Órgão emissor",
  data_nascimento: "Nascimento", nacionalidade: "Nacionalidade",
  cidade: "Cidade", uf: "UF",
};

type Values = Record<string, string | null | undefined>;

export function ClienteForm({
  id,
  values,
  submitLabel = "Salvar cliente",
}: {
  id?: string;
  values?: Values;
  submitLabel?: string;
}) {
  const action = id ? updateCliente.bind(null, id) : createCliente;
  const [state, formAction, pending] = useActionState(action, null);
  const v = values ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <DocImport
        tipo="cliente"
        titulo="Importar da CNH digital"
        hint="Envie o PDF da CNH digital ou uma foto — a IA preenche nome, CPF, RG, nascimento…"
        onExtract={(dados) => fillForm(formRef.current, dados, CLIENTE_LABELS)}
      />

      <Group title="Dados pessoais">
        <F name="nome" label="Nome completo" def={v.nome} required className="sm:col-span-2" />
        <F name="cpf" label="CPF" def={v.cpf} />
        <F name="rg" label="RG" def={v.rg} />
        <F name="orgao_emissor" label="Órgão emissor" def={v.orgao_emissor} />
        <F name="data_nascimento" label="Nascimento" def={v.data_nascimento} type="date" />
        <F name="nacionalidade" label="Nacionalidade" def={v.nacionalidade ?? "Brasileiro(a)"} />
        <F name="estado_civil" label="Estado civil" def={v.estado_civil} />
        <F name="profissao" label="Profissão" def={v.profissao} />
      </Group>

      <Group title="Contato">
        <F name="telefone" label="Telefone / WhatsApp" def={v.telefone} />
        <F name="email" label="E-mail" def={v.email} type="email" />
      </Group>

      <Group title="Endereço">
        <F name="cep" label="CEP" def={v.cep} />
        <F name="logradouro" label="Rua / Logradouro" def={v.logradouro} className="sm:col-span-2" />
        <F name="numero" label="Número" def={v.numero} />
        <F name="complemento" label="Complemento" def={v.complemento} />
        <F name="bairro" label="Bairro" def={v.bairro} />
        <F name="cidade" label="Cidade" def={v.cidade} />
        <F name="uf" label="UF" def={v.uf ?? "PR"} />
      </Group>

      <div>
        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
          Observações
        </label>
        <textarea
          name="observacoes"
          defaultValue={v.observacoes ?? ""}
          rows={3}
          className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
        />
      </div>

      <div>
        <h3 className="font-display mb-2 text-lg font-black uppercase text-[var(--color-red)]">
          Documentos do cliente
        </h3>
        <p className="mb-3 text-xs text-[var(--color-mute)]">
          RG, CPF, CNH, comprovante de residência, etc. (acesso restrito)
        </p>
        <FileUploader name="arquivos" initial={(v.arquivos as any) ?? []} prefix="clientes" />
      </div>

      {state?.error && (
        <p className="border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-sm text-[var(--color-red-bright)]">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-[var(--color-red)] px-7 py-3.5 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:opacity-60"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
        <Link
          href="/admin/clientes"
          className="border border-white/15 px-7 py-3.5 text-sm font-black uppercase text-white hover:border-white/40"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display mb-4 text-lg font-black uppercase text-[var(--color-red)]">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}

function F({
  name,
  label,
  def,
  type = "text",
  required,
  className = "",
}: {
  name: string;
  label: string;
  def?: string | null;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={def ?? ""}
        className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
      />
    </div>
  );
}
