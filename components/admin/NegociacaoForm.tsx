"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { PagamentoBuilder, type AvalOpt } from "@/components/admin/PagamentoBuilder";
import { QuickCreate } from "@/components/admin/QuickCreate";
import {
  createNegociacao,
  updateNegociacao,
  quickCliente,
  quickVeiculo,
} from "@/app/admin/(panel)/negociacoes/actions";

type Opt = { id: string; label: string };
const STATUS = [
  { v: "aberta", l: "Aberta" },
  { v: "fechada", l: "Fechada (venda concluída)" },
  { v: "cancelada", l: "Cancelada" },
];

export function NegociacaoForm({
  id,
  values,
  clientes: clientesProp,
  veiculos: veiculosProp,
  avaliacoes,
}: {
  id?: string;
  values?: any;
  clientes: Opt[];
  veiculos: Opt[];
  avaliacoes: AvalOpt[];
}) {
  const action = id ? updateNegociacao.bind(null, id) : createNegociacao;
  const [state, formAction, pending] = useActionState(action, null);
  const v = values ?? {};

  const [clientes, setClientes] = useState<Opt[]>(clientesProp);
  const [veiculos, setVeiculos] = useState<Opt[]>(veiculosProp);
  const [comprador, setComprador] = useState<string>(v.comprador_id ?? "");
  const [veiculo, setVeiculo] = useState<string>(v.veiculo_id ?? "");
  const [proprietario, setProprietario] = useState<string>(v.proprietario_id ?? "");
  const [trocaProp, setTrocaProp] = useState<string>(v.troca_proprietario_id ?? "");
  const [valor, setValor] = useState<string>(v.valor ? String(v.valor) : "");

  const [propDif, setPropDif] = useState(!!v.proprietario_id);
  const [temTroca, setTemTroca] = useState(!!v.tem_troca);
  const [trocaDif, setTrocaDif] = useState(!!v.troca_proprietario_id);

  const addCliente = (id: string, label: string) => setClientes((l) => [{ id, label }, ...l]);
  const addVeiculo = (id: string, label: string) => setVeiculos((l) => [{ id, label }, ...l]);
  const valorNum = Number(String(valor).replace(/[^\d]/g, "")) || 0;

  return (
    <form action={formAction} className="space-y-8">
      <Group title="Venda">
        <div>
          <CSel name="comprador_id" label="Comprador" options={clientes} value={comprador} onChange={setComprador} />
          <QuickCreate
            label="Novo cliente"
            fields={[{ key: "nome", placeholder: "Nome completo" }, { key: "cpf", placeholder: "CPF" }, { key: "telefone", placeholder: "Telefone" }]}
            onSave={(d) => quickCliente({ nome: d.nome, cpf: d.cpf, telefone: d.telefone })}
            onCreated={(id, label) => { addCliente(id, label); setComprador(id); }}
          />
        </div>
        <div>
          <CSel name="veiculo_id" label="Veículo vendido" options={veiculos} value={veiculo} onChange={setVeiculo} />
          <QuickCreate
            label="Novo veículo"
            fields={[{ key: "marca", placeholder: "Marca" }, { key: "modelo", placeholder: "Modelo" }, { key: "ano", placeholder: "Ano" }, { key: "preco", placeholder: "Preço (R$)" }]}
            onSave={(d) => quickVeiculo({ marca: d.marca, modelo: d.modelo, ano_modelo: d.ano, preco: d.preco })}
            onCreated={(id, label) => { addVeiculo(id, label); setVeiculo(id); }}
          />
        </div>
        <div>
          <Label>Valor da venda (R$)</Label>
          <input name="valor" type="number" value={valor} onChange={(e) => setValor(e.target.value)} className={inpCls} />
        </div>
        <div>
          <Label>Status</Label>
          <select name="status" defaultValue={v.status ?? "aberta"} className={selCls}>
            {STATUS.map((s) => (<option key={s.v} value={s.v}>{s.l}</option>))}
          </select>
        </div>
      </Group>

      <div className="border border-white/12 bg-black/20 p-5">
        <Check name="proprietario_diferente" checked={propDif} onChange={setPropDif}
          label="O proprietário do veículo vendido é outra pessoa (consignado / de terceiro)" />
        {propDif && (
          <div className="mt-4 max-w-md">
            <CSel name="proprietario_id" label="Proprietário do veículo (dono real)" options={clientes} value={proprietario} onChange={setProprietario} />
            <QuickCreate label="Novo cliente"
              fields={[{ key: "nome", placeholder: "Nome completo" }, { key: "cpf", placeholder: "CPF" }, { key: "telefone", placeholder: "Telefone" }]}
              onSave={(d) => quickCliente({ nome: d.nome, cpf: d.cpf, telefone: d.telefone })}
              onCreated={(id, label) => { addCliente(id, label); setProprietario(id); }} />
            <p className="mt-1.5 text-xs text-[var(--color-mute)]">Usado como <strong>outorgante</strong> na procuração do veículo vendido.</p>
          </div>
        )}
      </div>

      <div className="border border-white/12 bg-black/20 p-5">
        <Check name="tem_troca" checked={temTroca} onChange={setTemTroca} label="Há um carro na troca (parte do pagamento)" />
        {temTroca && (
          <div className="mt-4 space-y-4">
            <div className="max-w-md">
              <Sel name="avaliacao_id" label="Carro da troca (avaliação)" options={avaliacoes.map((a) => ({ id: a.id, label: a.label }))} def={v.avaliacao_id} />
              <p className="mt-1.5 text-xs text-[var(--color-mute)]">O carro precisa estar cadastrado em <strong>Avaliações</strong>.</p>
            </div>
            <Check name="troca_proprietario_diferente" checked={trocaDif} onChange={setTrocaDif} label="O dono do carro da troca é outra pessoa (não o comprador)" />
            {trocaDif && (
              <div className="max-w-md">
                <CSel name="troca_proprietario_id" label="Dono do carro da troca" options={clientes} value={trocaProp} onChange={setTrocaProp} />
                <QuickCreate label="Novo cliente"
                  fields={[{ key: "nome", placeholder: "Nome completo" }, { key: "cpf", placeholder: "CPF" }, { key: "telefone", placeholder: "Telefone" }]}
                  onSave={(d) => quickCliente({ nome: d.nome, cpf: d.cpf, telefone: d.telefone })}
                  onCreated={(id, label) => { addCliente(id, label); setTrocaProp(id); }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <Label>Formas de pagamento</Label>
        <p className="-mt-1 mb-3 text-xs text-[var(--color-mute)]">
          Some várias formas. Conforme você informa, mostramos quanto falta pra fechar.
        </p>
        <PagamentoBuilder name="pagamentos" avaliacoes={avaliacoes} alvo={valorNum} />
      </div>

      <div>
        <Label>Observações</Label>
        <textarea name="observacoes" defaultValue={v.observacoes ?? ""} rows={3} className="w-full resize-none border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]" />
      </div>

      {state?.error && (
        <p className="border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-sm text-[var(--color-red-bright)]">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="bg-[var(--color-red)] px-7 py-3.5 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:opacity-60">
          {pending ? "Salvando..." : id ? "Atualizar negociação" : "Criar negociação"}
        </button>
        <Link href="/admin/negociacoes" className="border border-white/15 px-7 py-3.5 text-sm font-black uppercase text-white hover:border-white/40">Cancelar</Link>
      </div>
    </form>
  );
}

const selCls = "w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]";
const inpCls = "w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display mb-4 text-lg font-black uppercase text-[var(--color-red)]">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">{children}</label>;
}
// select controlado (permite injetar opção criada na hora)
function CSel({ name, label, options, value, onChange }: { name: string; label: string; options: Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} className={selCls}>
        <option value="">— selecione —</option>
        {options.map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
      </select>
    </div>
  );
}
function Sel({ name, label, options, def }: { name: string; label: string; options: Opt[]; def?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <select name={name} defaultValue={def ?? ""} className={selCls}>
        <option value="">— selecione —</option>
        {options.map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
      </select>
    </div>
  );
}
function Check({ name, checked, onChange, label }: { name: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-white">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}
