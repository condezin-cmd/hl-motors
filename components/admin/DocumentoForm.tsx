"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { gerarDocumento } from "@/app/admin/(panel)/documentos/actions";
import { PagamentoBuilder, type AvalOpt } from "@/components/admin/PagamentoBuilder";

type Opt = { id: string; label: string };

const TIPOS = [
  { v: "contrato", l: "Contrato de compra e venda" },
  { v: "procuracao", l: "Procuração (transferência)" },
  { v: "termo_consignacao", l: "Termo de consignação" },
  { v: "declaracao_residencia", l: "Declaração de residência" },
];

export function DocumentoForm({
  clientes,
  veiculos,
  avaliacoes,
}: {
  clientes: Opt[];
  veiculos: Opt[];
  avaliacoes: AvalOpt[];
}) {
  const [state, action, pending] = useActionState(gerarDocumento, null);
  const [tipo, setTipo] = useState("contrato");

  const needVeiculo = tipo === "contrato" || tipo === "termo_consignacao" || tipo === "procuracao";
  const needCliente2 = tipo === "procuracao";
  const showValor = tipo === "contrato" || tipo === "termo_consignacao";
  const showConsig = tipo === "termo_consignacao";

  const clienteLabel =
    tipo === "contrato" ? "Comprador"
    : tipo === "procuracao" ? "Outorgante (dono atual)"
    : tipo === "termo_consignacao" ? "Proprietário"
    : "Cliente";

  return (
    <form action={action} className="space-y-6">
      <div>
        <Label>Tipo de documento</Label>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
        >
          {TIPOS.map((t) => (
            <option key={t.v} value={t.v}>{t.l}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Sel name="cliente_id" label={clienteLabel} options={clientes} required />
        {needCliente2 && (
          <Sel name="cliente2_id" label="Outorgado (recebe os poderes)" options={clientes} required />
        )}
        {needVeiculo && <Sel name="veiculo_id" label="Veículo" options={veiculos} required />}
      </div>

      {showValor && (
        <div className="grid gap-4 sm:grid-cols-2">
          <F name="valor" label="Valor da venda (R$)" placeholder="vazio = usa o preço do veículo" />
          {showConsig && <F name="comissao" label="Comissão da empresa (R$)" def="3000" placeholder="fixo R$ 3.000" />}
          {showConsig && <F name="telefone" label="Telefone do proprietário" />}
        </div>
      )}

      {tipo === "contrato" && (
        <div>
          <Label>Formas de pagamento</Label>
          <p className="-mt-1 mb-3 text-xs text-[var(--color-mute)]">
            Some várias formas. Para incluir um carro na troca, ele precisa estar em{" "}
            <strong>Avaliações</strong>.
          </p>
          <PagamentoBuilder name="pagamentos" avaliacoes={avaliacoes} />
        </div>
      )}

      {(tipo === "contrato" || tipo === "termo_consignacao") && (
        <div>
          <Label>Observações</Label>
          <textarea
            name="observacoes"
            rows={3}
            className="w-full resize-none border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          />
        </div>
      )}

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
          {pending ? "Gerando..." : "Gerar documento"}
        </button>
        <Link href="/admin/documentos" className="border border-white/15 px-7 py-3.5 text-sm font-black uppercase text-white hover:border-white/40">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
      {children}
    </label>
  );
}

function Sel({ name, label, options, required }: { name: string; label: string; options: Opt[]; required?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
      >
        <option value="">— selecione —</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function F({ name, label, placeholder, def }: { name: string; label: string; placeholder?: string; def?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        name={name}
        placeholder={placeholder}
        defaultValue={def}
        className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-red)]"
      />
    </div>
  );
}
